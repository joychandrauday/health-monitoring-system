'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { SignalData } from 'simple-peer';
import { useSession } from 'next-auth/react';
import { IAppointment } from '@/types';
import { useAppContext } from '@/lib/FirebaseContext';
import useSocket from './useSocket';
import { debugWebRTC } from '@/components/utils/debugWebRTC';

interface PeerData {
    peerConnection: Peer.Instance;
    callerId: string;
    receiverId: string;
    stream?: MediaStream;
}

interface UseVideoChatReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isCallActive: boolean;
    startVideoCall: (appointment: IAppointment) => Promise<void>;
    acceptCall: () => Promise<void>;
    declineCall: () => void;
    hangUp: () => void;
    toggleAudioMute: () => void;
    toggleVideoMute: () => void;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    error: string | null;
}

export const useVideoChat = (): UseVideoChatReturn => {
    const { data: session } = useSession();
    const { isConnected, isOnline: isOnlineUser, declineCall: contextDeclineCall, clearRinging } = useAppContext();
    const { socket } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [peer, setPeer] = useState<PeerData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const callDataRef = useRef<{ appointmentId: string; callerId: string; recipientId: string; callerName: string } | null>(null);

    const getMediaStream = useCallback(async (facingMode: string = 'user'): Promise<MediaStream | null> => {
        if (localStream) {
            console.log('Using existing media stream:', localStream.id);
            return localStream;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode },
            });
            console.log('Media stream acquired:', stream.id);
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Failed to get media stream:', err);
            setError('Failed to access camera/microphone');
            return null;
        }
    }, [localStream]);

    const stopMediaStream = useCallback((stream: MediaStream | null) => {
        if (stream) {
            console.log('Stopping media stream:', stream.id);
            stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
        }
    }, []);

    const cleanup = useCallback(() => {
        console.log('Cleaning up video chat');
        stopMediaStream(localStream);
        stopMediaStream(remoteStream);
        if (peer) {
            peer.peerConnection.destroy();
            setPeer(null);
        }
        setLocalStream(null);
        setRemoteStream(null);
        setIsCallActive(false);
        setIsAudioMuted(false);
        setIsVideoMuted(false);
        setError(null);
        callDataRef.current = null;
        clearRinging();
        if (socket && session?.user?.id) {
            socket.emit('clearCallState', { userId: session.user.id });
            console.log('Emitted clearCallState during cleanup');
        }
    }, [localStream, remoteStream, peer, stopMediaStream, clearRinging, socket, session?.user?.id]);

    const createPeer = useCallback((stream: MediaStream, initiator: boolean, callerId: string, receiverId: string) => {
        const iceServers: RTCIceServer[] = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            {
                urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                username: 'webrtc',
                credential: 'webrtc',
            },
        ];
        const peerConnection = new Peer({
            initiator,
            trickle: true,
            stream,
            config: { iceServers },
        });

        peerConnection.on('signal', (data: SignalData) => {
            console.log('Peer signal generated:', { callerId, receiverId, signalData: data });
            if (socket && session?.user?.id && callDataRef.current) {
                console.log('Emitting signal:', { callerId, receiverId, appointmentId: callDataRef.current.appointmentId });
                socket.emit('signal', {
                    appointmentId: callDataRef.current.appointmentId,
                    callerId,
                    receiverId,
                    signalData: data,
                });
            }
            // NEW: Extended signal retry
            if (socket && session?.user?.id && callDataRef.current) {
                setTimeout(() => {
                    socket.emit('signal', {
                        appointmentId: callDataRef.current?.appointmentId,
                        callerId,
                        receiverId,
                        signalData: data,
                    });
                    console.log('Retried signal emission:', { callerId, receiverId });
                }, 1000);
            }
        });

        peerConnection.on('stream', (stream: MediaStream) => {
            console.log('Received remote stream:', stream.id);
            setRemoteStream(stream);
            setIsCallActive(true);
        });

        peerConnection.on('error', (err: Error) => {
            console.error('Peer error:', err);
            setError('Peer connection error');
            cleanup();
        });

        peerConnection.on('close', () => {
            console.log('Peer connection closed');
            cleanup();
        });

        if (callDataRef.current) {
            debugWebRTC(peerConnection, {
                callerId,
                receiverId,
                appointmentId: callDataRef.current.appointmentId,
            });
        }

        return peerConnection;
    }, [session?.user?.id, socket, cleanup]);

    const startVideoCall = useCallback(async (appointment: IAppointment) => {
        console.log('startVideoCall initiated:', {
            appointmentId: appointment._id,
            isConnected,
            hasSocket: !!socket,
            userId: session?.user?.id,
            appointmentData: { patientId: appointment.patientId, doctorId: appointment.doctorId },
        });
        if (!isConnected || !socket || !session?.user?.id) {
            setError('Not connected to server');
            console.error('startVideoCall failed: No socket or user ID');
            return;
        }

        const patientId = typeof appointment.patientId === 'string' ? appointment.patientId : appointment.patientId?._id;
        const doctorId = typeof appointment.doctorId === 'string' ? appointment.doctorId : appointment.doctorId?._id;
        if (!patientId || !doctorId) {
            setError('Invalid appointment data: Missing patient or doctor ID');
            console.error('startVideoCall failed: Invalid patientId or doctorId', { patientId, doctorId });
            return;
        }

        const recipientId = session.user.id === patientId ? doctorId : session.user.id === doctorId ? patientId : null;
        if (!recipientId) {
            setError('Invalid recipient: User is neither patient nor doctor');
            console.error('startVideoCall failed: User is not part of appointment', {
                userId: session.user.id,
                patientId,
                doctorId,
            });
            return;
        }

        if (recipientId === session.user.id) {
            setError('Cannot call yourself');
            console.error('startVideoCall failed: recipientId matches callerId', { recipientId, callerId: session.user.id });
            return;
        }

        const callerName = session.user.name || 'User';

        if (!isOnlineUser(recipientId)) {
            setError('Recipient is offline');
            console.error('startVideoCall failed: Recipient offline', recipientId);
            return;
        }

        const stream = await getMediaStream();
        if (!stream) {
            setError('Failed to access camera/microphone');
            console.error('startVideoCall failed: No media stream');
            return;
        }

        const newPeer = createPeer(stream, true, session.user.id, recipientId);
        setPeer({ peerConnection: newPeer, callerId: session.user.id, receiverId: recipientId });
        callDataRef.current = {
            appointmentId: appointment._id,
            callerId: session.user.id,
            recipientId,
            callerName,
        };

        console.log('Emitting startVideoCall:', callDataRef.current);
        socket.emit('startVideoCall', callDataRef.current);
    }, [isConnected, socket, session?.user?.id, session?.user?.name, isOnlineUser, getMediaStream, createPeer]);

    const acceptCall = useCallback(async () => {
        console.log('acceptCall initiated:', {
            isConnected,
            hasSocket: !!socket,
            userId: session?.user?.id,
            callData: callDataRef.current,
        });
        if (!isConnected || !socket || !session?.user?.id || !callDataRef.current) {
            setError('Cannot accept call: Not connected or missing call data');
            console.error('acceptCall failed: No connection or call data');
            return;
        }

        if (callDataRef.current.callerId === session.user.id) {
            console.error('acceptCall failed: Cannot accept own call', { callerId: callDataRef.current.callerId });
            return;
        }

        const stream = await getMediaStream();
        if (!stream) {
            setError('Failed to access camera/microphone');
            console.error('acceptCall failed: No media stream');
            return;
        }

        const newPeer = createPeer(stream, false, callDataRef.current.callerId, session.user.id);
        setPeer({ peerConnection: newPeer, callerId: callDataRef.current.callerId, receiverId: session.user.id });

        console.log('Emitting callAccepted:', callDataRef.current);
        socket.emit('callAccepted', {
            appointmentId: callDataRef.current.appointmentId,
            callerId: callDataRef.current.callerId,
            recipientId: session.user.id,
        });

        console.log('Call accepted, setting isCallActive for receiver');
        setIsCallActive(true);
        // NEW: Delay clearCallState
        setTimeout(() => {
            if (socket && session?.user?.id) {
                socket.emit('clearCallState', { userId: session.user.id });
                console.log('Delayed clearCallState on accept');
            }
        }, 2000);
    }, [isConnected, socket, session?.user?.id, getMediaStream, createPeer]);

    const declineCall = useCallback(() => {
        console.log('declineCall initiated:', callDataRef.current);
        if (callDataRef.current && socket && session?.user?.id) {
            socket.emit('declineVideoCall', {
                appointmentId: callDataRef.current.appointmentId,
                callerId: callDataRef.current.callerId,
                recipientId: session.user.id,
            });
            contextDeclineCall(
                callDataRef.current.appointmentId,
                callDataRef.current.callerId,
                session.user.id
            );
            cleanup();
        }
        if (socket && session?.user?.id) {
            socket.emit('clearCallState', { userId: session.user.id });
            console.log('Emitted clearCallState on decline');
        }
    }, [socket, session?.user?.id, contextDeclineCall, cleanup]);

    const hangUp = useCallback(() => {
        console.log('hangUp initiated:', callDataRef.current);
        if (callDataRef.current && socket && session?.user?.id) {
            socket.emit('hangUp', {
                appointmentId: callDataRef.current.appointmentId,
                callerId: callDataRef.current.callerId,
                recipientId: callDataRef.current.recipientId,
            });
        }
        cleanup();
        if (socket && session?.user?.id) {
            socket.emit('clearCallState', { userId: session.user.id });
            console.log('Emitted clearCallState on hangUp');
        }
    }, [socket, session?.user?.id, cleanup]);

    const toggleAudioMute = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !isAudioMuted;
                console.log(`Audio track ${track.id} enabled: ${track.enabled}`);
            });
            setIsAudioMuted(!isAudioMuted);
        }
    }, [localStream, isAudioMuted]);

    const toggleVideoMute = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !isVideoMuted;
                console.log(`Video track ${track.id} enabled: ${track.enabled}`);
            });
            setIsVideoMuted(!isVideoMuted);
        }
    }, [localStream, isVideoMuted]);

    useEffect(() => {
        if (!socket || !session?.user?.id) {
            console.log('Skipping socket listeners: No socket or user ID');
            return;
        }

        const handleStartVideoCall = (data: { appointmentId: string; callerId: string; recipientId: string; callerName: string }) => {
            console.log('Received startVideoCall:', data);
            if (data.recipientId === session.user?.id) {
                callDataRef.current = data;
            }
        };

        const handleSignal = (data: { appointmentId: string; callerId: string; receiverId: string; signalData: SignalData }) => {
            console.log('Received signal:', data);
            if (peer && data.appointmentId === callDataRef.current?.appointmentId) {
                console.log('Processing signal for peer:', data.signalData);
                peer.peerConnection.signal(data.signalData);
            }
            // NEW: Extended signal retry
            if (peer && data.appointmentId === callDataRef.current?.appointmentId) {
                setTimeout(() => {
                    peer.peerConnection.signal(data.signalData);
                    console.log('Retried signal processing');
                }, 1000);
            }
        };

        const handleCallAccepted = (data: { appointmentId: string; callerId: string; recipientId: string }) => {
            console.log('Received callAccepted:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId && session.user?.id === data.callerId) {
                setIsCallActive(true);
            }
            console.log('Call accepted received for caller:', { isCallActive: true, userId: session.user?.id });
            // NEW: Force isCallActive for caller
            if (data.appointmentId === callDataRef.current?.appointmentId && session.user?.id === data.callerId) {
                setIsCallActive(true);
                console.log('Forced isCallActive for caller on callAccepted');
            }
            // NEW: Delay clearCallState for caller
            if (socket && session?.user?.id && session.user?.id === data.callerId) {
                setTimeout(() => {
                    socket.emit('clearCallState', { userId: session.user?.id });
                    console.log('Delayed clearCallState for caller on callAccepted');
                }, 2000);
            }
        };

        const handleCallDeclined = (data: { appointmentId: string; recipientId: string }) => {
            console.log('Received callDeclined:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId && session.user?.id === callDataRef.current?.callerId) {
                cleanup();
            }
            if (socket && session?.user?.id) {
                socket.emit('clearCallState', { userId: session.user?.id });
                console.log('Emitted clearCallState on callDeclined');
            }
        };

        const handleHangUp = (data: { appointmentId: string }) => {
            console.log('Received hangUp:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId) {
                cleanup();
            }
            if (socket && session?.user?.id) {
                socket.emit('clearCallState', { userId: session.user.id });
                console.log('Emitted clearCallState on hangUp');
            }
        };

        const handleClearCallState = ({ userId }: { userId: string }) => {
            if (userId === session.user?.id) {
                callDataRef.current = null;
                setIsCallActive(false);
                console.log('Cleared call state for user:', userId);
            }
        };

        socket.on('startVideoCall', handleStartVideoCall);
        socket.on('signal', handleSignal);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callDeclined', handleCallDeclined);
        socket.on('hangUp', handleHangUp);
        socket.on('clearCallState', handleClearCallState);

        return () => {
            socket.off('startVideoCall', handleStartVideoCall);
            socket.off('signal', handleSignal);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callDeclined', handleCallDeclined);
            socket.off('hangUp', handleHangUp);
            socket.off('clearCallState', handleClearCallState);
        };
    }, [socket, session?.user?.id, peer, cleanup]);

    return {
        localStream,
        remoteStream,
        isCallActive,
        startVideoCall,
        acceptCall,
        declineCall,
        hangUp,
        toggleAudioMute,
        toggleVideoMute,
        isAudioMuted,
        isVideoMuted,
        error,
    };
};