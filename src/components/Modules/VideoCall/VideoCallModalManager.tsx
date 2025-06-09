'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/lib/FirebaseContext';
import { useVideoChat } from '@/hooks/useVideoChat';
import { useVideoCallContext } from '@/lib/VideoCallContext';
import { CallerRingingModal } from './CallerRingingModal';
import { ReceiverRingingModal } from './ReceiverRingingModal';
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
    const [isCallerRingingModalOpen, setIsCallerRingingModalOpen] = useState(false);
    const [isReceiverRingingModalOpen, setIsReceiverRingingModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);

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
            setIsCallerRingingModalOpen(false);
            setIsReceiverRingingModalOpen(false);
            setIsDeclined(false);
            console.log('Call is active, opening video modal');
        } else if (incomingCall && session?.user?.id === incomingCall.recipientId && !isDeclined) {
            setIsReceiverRingingModalOpen(true);
            setIsCallerRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsDeclined(false);
            console.log('User is receiver for incoming call:', incomingCall);
        } else if (callRinging && session?.user?.id === callRinging.callerId && !isDeclined) {
            setIsCallerRingingModalOpen(true);
            setIsReceiverRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsDeclined(false);
            console.log('User is caller for ringing call:', callRinging);
        } else {
            setIsCallerRingingModalOpen(false);
            setIsReceiverRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsDeclined(false);
            console.log('Closing all modals');
        }
    }, [callRinging, incomingCall, session?.user?.id, isCallActive, localStream, remoteStream, isDeclined]);

    const handleAccept = () => {
        console.log('Handling accept call');
        acceptCall();
        setIsReceiverRingingModalOpen(false);
        setIsVideoModalOpen(true);
        setIsDeclined(false);
        console.log('Accept call handled, opening video modal');
    };

    const handleCancel = () => {
        console.log('Handling cancel/decline call', { incomingCall, callRinging });
        if (incomingCall && session?.user?.id === incomingCall.recipientId) {
            declineCall();
            setIsDeclined(true);
        } else if (callRinging && session?.user?.id === callRinging.callerId) {
            contextDeclineCall(
                callRinging.appointmentId,
                callRinging.callerId,
                callRinging.recipientId
            );
            setIsDeclined(true);
        }
        setTimeout(() => {
            setIsCallerRingingModalOpen(false);
            setIsReceiverRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsDeclined(false);
            console.log('Modals closed after decline');
        }, 1000);
    };

    return (
        <>
            <CallerRingingModal
                isOpen={isCallerRingingModalOpen && !isCallActive}
                recipientName={callRinging?.recipientId || 'Unknown'}
                onCancel={handleCancel}
                isDeclined={isDeclined}
                localStream={localStream}
                toggleAudioMute={toggleAudioMute}
                toggleVideoMute={toggleVideoMute}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
            />
            <ReceiverRingingModal
                isOpen={isReceiverRingingModalOpen && !isCallActive}
                callerName={incomingCall?.callerName || 'Unknown'}
                onAccept={handleAccept}
                onCancel={handleCancel}
                isDeclined={isDeclined}
                localStream={localStream}
                toggleAudioMute={toggleAudioMute}
                toggleVideoMute={toggleVideoMute}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
            />
            {
                isVideoModalOpen &&
                <VideoCallModalWrapper />
            }
        </>
    );
};

export default VideoCallModalManager;