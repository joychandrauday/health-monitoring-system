/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/lib/FirebaseContext';
import { useVideoChat } from '@/hooks/useVideoChat';
import { useVideoCallContext } from '@/lib/VideoCallContext';
import { CallRingingModal } from './CallRingingModal';
import VideoCallModalWrapper from './VideoCallModalWrapper';

export const VideoCallModalManager: React.FC = () => {
    const { data: session } = useSession();
    const { callRinging, incomingCall } = useVideoCallContext();
    const { declineCall: contextDeclineCall } = useAppContext();
    const {
        localStream,
        remoteStream,
        toggleAudioMute,
        toggleVideoMute,
        isAudioMuted,
        isVideoMuted,
        acceptCall,
        declineCall,
        isCallActive,
    } = useVideoChat();
    const [isRingingModalOpen, setIsRingingModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isReceiver, setIsReceiver] = useState(false);

    useEffect(() => {
        console.log('VideoCallModalManager state:', {
            callRinging,
            incomingCall,
            userId: session?.user?.id,
            isCallActive,
            hasLocalStream: !!localStream,
            hasRemoteStream: !!remoteStream,
        });

        if (isCallActive) {
            setIsVideoModalOpen(true);
            setIsRingingModalOpen(false);
            setIsDeclined(false);
            console.log('Call is active, opening video modal');
        } else if (incomingCall && session?.user?.id === incomingCall.recipientId && !isDeclined) {
            setIsRingingModalOpen(true);
            setIsVideoModalOpen(false);
            setIsReceiver(true);
            setIsDeclined(false);
            console.log('User is receiver for incoming call:', incomingCall);
        } else if (callRinging && session?.user?.id === callRinging.callerId && !isDeclined) {
            setIsRingingModalOpen(true);
            setIsVideoModalOpen(false);
            setIsReceiver(false);
            setIsDeclined(false);
            console.log('User is caller for ringing call:', callRinging);
        } else {
            setIsRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsReceiver(false);
            setIsDeclined(false);
            console.log('Closing all modals');
        }
    }, [callRinging, incomingCall, session?.user?.id, isCallActive, localStream, remoteStream, isDeclined]);

    const handleAccept = () => {
        console.log('Handling accept call');
        acceptCall();
        setIsRingingModalOpen(false);
        setIsVideoModalOpen(true);
        setIsDeclined(false);
        console.log('Accept call handled, opening video modal');
        const socket = (window as any).__SOCKET__;
        if (socket && session?.user?.id) {
            setTimeout(() => {
                socket.emit('clearCallState', { userId: session.user?.id });
                console.log('Emitted clearCallState on accept');
            }, 1000);
        }
    };

    const handleCancel = () => {
        console.log('Handling cancel/decline call', { isReceiver, incomingCall, callRinging });
        if (isReceiver && incomingCall) {
            declineCall();
            setIsDeclined(true);
        } else if (callRinging) {
            contextDeclineCall(
                callRinging.appointmentId,
                callRinging.callerId,
                callRinging.recipientId
            );
            setIsDeclined(true);
        }
        setTimeout(() => {
            setIsRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsDeclined(false);
            console.log('Modals closed after decline');
        }, 1000);
        const socket = (window as any).__SOCKET__;
        if (socket && session?.user?.id) {
            socket.emit('clearCallState', { userId: session.user.id });
            console.log('Emitted clearCallState on decline');
        }
    };

    return (
        <>
            <CallRingingModal
                isOpen={isRingingModalOpen && !isCallActive}
                recipientId={callRinging?.recipientId || incomingCall?.recipientId || ''}
                recipientName={callRinging?.callerName || incomingCall?.callerName || 'Unknown'}
                onAccept={handleAccept}
                onCancel={handleCancel}
                isDeclined={isDeclined}
                localStream={localStream}
                toggleAudioMute={toggleAudioMute}
                toggleVideoMute={toggleVideoMute}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                isReceiver={isReceiver}
            />
            <VideoCallModalWrapper />
        </>
    );
};

export default VideoCallModalManager;