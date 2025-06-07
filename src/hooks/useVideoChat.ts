'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { SignalData } from 'simple-peer';
import { useSession } from 'next-auth/react';
import { IAppointment } from '@/types';
import useSocket from './useSocket';
import { useAppContext } from '@/lib/FirebaseContext';

interface PeerData {
    peerConnection: Peer.Instance;
    callerId: string;
    receiverId: string;
    stream?: MediaStream | null;
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
    }, [localStream, remoteStream, peer, stopMediaStream, clearRinging]);

    const createPeer = useCallback((stream: MediaStream, initiator: boolean, callerId: string, receiverId: string) => {
        const iceServers: RTCIceServer[] = [
            { urls: ['stun:stun.l.google.com:19302'] },
        ];
        const peerConnection = new Peer({
            initiator,
            trickle: true,
            stream,
            config: { iceServers },
        });

        peerConnection.on('signal', (data: SignalData) => {
            if (socket && session?.user?.id && callDataRef.current) {
                console.log('Emitting signal:', { callerId, receiverId, appointmentId: callDataRef.current.appointmentId });
                socket.emit('signal', {
                    appointmentId: callDataRef.current.appointmentId,
                    callerId,
                    receiverId,
                    signalData: data,
                });
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

        const recipientId = session.user?.id === patientId ? doctorId : session.user?.id === doctorId ? patientId : null;
        if (!recipientId) {
            setError('Invalid recipient: User is neither patient nor doctor');
            console.error('startVideoCall failed: User is not part of appointment', {
                userId: session.user?.id,
                patientId,
                doctorId,
            });
            return;
        }

        if (recipientId === session.user?.id) {
            setError('Cannot call yourself');
            console.error('startVideoCall failed: recipientId matches callerId', { recipientId, callerId: session.user?.id });
            return;
        }

        const callerName = session.user?.name || 'User';

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

        const newPeer = createPeer(stream, true, session.user?.id, recipientId);
        setPeer({ peerConnection: newPeer, callerId: session.user?.id, receiverId: recipientId });
        callDataRef.current = {
            appointmentId: appointment._id,
            callerId: session.user?.id,
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

        if (callDataRef.current.callerId === session.user?.id) {
            console.error('acceptCall failed: Cannot accept own call', { callerId: callDataRef.current.callerId });
            return;
        }

        const stream = await getMediaStream();
        if (!stream) {
            setError('Failed to access camera/microphone');
            console.error('acceptCall failed: No media stream');
            return;
        }

        const newPeer = createPeer(stream, false, callDataRef.current.callerId, session.user?.id);
        setPeer({ peerConnection: newPeer, callerId: callDataRef.current.callerId, receiverId: session.user?.id });

        console.log('Emitting callAccepted:', callDataRef.current);
        socket.emit('callAccepted', {
            appointmentId: callDataRef.current.appointmentId,
            callerId: callDataRef.current.callerId,
            recipientId: session.user?.id,
        });
    }, [isConnected, socket, session?.user?.id, getMediaStream, createPeer]);

    const declineCall = useCallback(() => {
        console.log('declineCall initiated:', callDataRef.current);
        if (callDataRef.current && socket && session?.user?.id) {
            socket.emit('declineVideoCall', {
                appointmentId: callDataRef.current.appointmentId,
                callerId: callDataRef.current.callerId,
                recipientId: session.user?.id,
            });
            contextDeclineCall(
                callDataRef.current.appointmentId,
                callDataRef.current.callerId,
                session.user?.id
            );
            cleanup();
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
    }, [socket, session?.user?.id, cleanup]);

    const toggleAudioMute = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !isAudioMuted;
            });
            setIsAudioMuted(!isAudioMuted);
        }
    }, [localStream, isAudioMuted]);

    const toggleVideoMute = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !isVideoMuted;
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
                peer.peerConnection.signal(data.signalData);
            }
        };

        const handleCallAccepted = (data: { appointmentId: string; callerId: string; recipientId: string }) => {
            console.log('Received callAccepted:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId && session.user?.id === data.callerId) {
                setIsCallActive(true);
            }
        };

        const handleCallDeclined = (data: { appointmentId: string; recipientId: string }) => {
            console.log('Received callDeclined:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId && session.user?.id === callDataRef.current?.callerId) {
                cleanup();
            }
        };

        const handleHangUp = (data: { appointmentId: string }) => {
            console.log('Received hangUp:', data);
            if (data.appointmentId === callDataRef.current?.appointmentId) {
                cleanup();
            }
        };

        socket.on('startVideoCall', handleStartVideoCall);
        socket.on('signal', handleSignal);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callDeclined', handleCallDeclined);
        socket.on('hangUp', handleHangUp);

        return () => {
            socket.off('startVideoCall', handleStartVideoCall);
            socket.off('signal', handleSignal);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callDeclined', handleCallDeclined);
            socket.off('hangUp', handleHangUp);
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