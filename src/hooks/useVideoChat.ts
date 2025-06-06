/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { SignalData } from 'simple-peer';
import { useSession } from 'next-auth/react';
import { useSocketContext } from '@/lib/SocketContext';
import { IAppointment } from '@/types';

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
    const { socket, isConnected, isOnline, declineCall: socketDeclineCall, clearRinging } = useSocketContext();
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
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 360, ideal: 720, max: 1080 },
                    frameRate: { min: 16, ideal: 30, max: 30 },
                    facingMode: videoDevices.length > 0 ? facingMode : undefined,
                },
            });
            console.log('Media stream acquired:', stream.id);
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Failed to get media stream:', err);
            setError('Failed to access camera and microphone');
            setLocalStream(null);
            return null;
        }
    }, [localStream]);

    const stopMediaStream = useCallback((stream: MediaStream | null) => {
        if (stream) {
            console.log('Stopping media stream:', stream.id);
            stream.getTracks().forEach(track => {
                console.log(`Stopping track: ${track.kind} (id: ${track.id}, enabled: ${track.enabled})`);
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
    }, [localStream, remoteStream, peer, stopMediaStream]);

    const createPeer = useCallback((stream: MediaStream, initiator: boolean, callerId: string, receiverId: string) => {
        const iceServers: RTCIceServer[] = [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun3.l.google.com:19302',
                ],
            },
        ];
        const peerConnection = new Peer({
            initiator,
            trickle: true,
            stream,
            config: { iceServers },
        });

        peerConnection.on('signal', (data: SignalData) => {
            if (socket && session?.user?.id) {
                console.log('Emitting signal:', { callerId, receiverId, signalData: data });
                socket.emit('signal', {
                    appointmentId: callDataRef.current?.appointmentId,
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

        const rtcPeerConnection: RTCPeerConnection = (peerConnection as any)._pc as RTCPeerConnection;
        rtcPeerConnection.oniceconnectionstatechange = () => {
            if (rtcPeerConnection.iceConnectionState === 'disconnected' || rtcPeerConnection.iceConnectionState === 'failed') {
                console.log('ICE connection state:', rtcPeerConnection.iceConnectionState);
                cleanup();
            }
        };

        return peerConnection;
    }, [socket, session?.user?.id, cleanup]);

    const startVideoCall = useCallback(async (appointment: IAppointment) => {
        if (!isConnected || !socket || !session?.user?.id) {
            setError('Not connected to the server');
            return;
        }

        const patientId = typeof appointment.patientId === 'string' ? appointment.patientId : appointment.patientId._id;
        const doctorId = typeof appointment.doctorId === 'string' ? appointment.doctorId : appointment.doctorId._id;
        const recipientId = session.user.id === patientId ? doctorId : patientId;
        const callerName = session.user.name || 'User';

        if (!isOnline(recipientId)) {
            setError('Cannot initiate call: The other user is offline');
            return;
        }

        const stream = await getMediaStream();
        if (!stream) {
            setError('Failed to access camera and microphone');
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

        socket.emit('startVideoCall', callDataRef.current);
        console.log('Emitted startVideoCall:', callDataRef.current);
    }, [isConnected, socket, session?.user?.id, session?.user?.name, isOnline, getMediaStream, createPeer]);

    const acceptCall = useCallback(async () => {
        if (!isConnected || !socket || !session?.user?.id || !callDataRef.current) {
            setError('Cannot accept call: Not connected or missing call data');
            return;
        }

        const stream = await getMediaStream();
        if (!stream) {
            setError('Failed to access camera and microphone');
            return;
        }

        const newPeer = createPeer(stream, false, callDataRef.current.callerId, session.user.id);
        setPeer({ peerConnection: newPeer, callerId: callDataRef.current.callerId, receiverId: session.user.id });
        setIsCallActive(true);
        clearRinging();
    }, [isConnected, socket, session?.user?.id, getMediaStream, createPeer, clearRinging]);

    const declineCall = useCallback(() => {
        if (callDataRef.current && socket && session?.user?.id) {
            socketDeclineCall(
                callDataRef.current.appointmentId,
                callDataRef.current.callerId,
                session.user.id
            );
            console.log('Declining call:', callDataRef.current);
            cleanup();
        }
    }, [socket, session?.user?.id, socketDeclineCall, cleanup]);

    const hangUp = useCallback(() => {
        if (callDataRef.current && socket && session?.user?.id) {
            socket.emit('hangUp', {
                appointmentId: callDataRef.current.appointmentId,
                callerId: callDataRef.current.callerId,
                recipientId: callDataRef.current.recipientId,
            });
            console.log('Emitted hangUp:', callDataRef.current);
        }
        cleanup();
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
        if (!socket || !session?.user?.id) return;

        socket.on('signal', (data: { callerId: string; receiverId: string; signalData: SignalData }) => {
            if (data.receiverId === session?.user?.id && peer) {
                console.log('Received signal for peer:', data);
                peer.peerConnection.signal(data.signalData);
            }
        });

        socket.on('receiveVideoCall', (data: { callerId: string; callerName: string; appointmentId: string; recipientId: string }) => {
            if (data.recipientId === session?.user?.id) {
                console.log('Received incoming call:', data);
                callDataRef.current = data;
            }
        });

        socket.on('callDeclined', (data: { appointmentId: string; recipientId: string }) => {
            if (data.appointmentId === callDataRef.current?.appointmentId) {
                console.log('Call declined:', data);
                cleanup();
            }
        });

        socket.on('hangUp', (data: { appointmentId: string }) => {
            if (data.appointmentId === callDataRef.current?.appointmentId) {
                console.log('Received hangUp:', data);
                cleanup();
            }
        });

        return () => {
            socket.off('signal');
            socket.off('receiveVideoCall');
            socket.off('callDeclined');
            socket.off('hangUp');
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