'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useVideoChat } from '@/hooks/useVideoChat';
import { CallRingingModal } from './CallRingingModal';
import { useVideoCallContext } from '@/lib/VideoCallContext';
import { useAppContext } from '@/lib/FirebaseContext';
import { VideoCallModal } from './VideoCallModal';

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
        hangUp,
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
            console.log('Call is active, opening video modal');
            setIsVideoModalOpen(true);
            setIsRingingModalOpen(false);
            setIsDeclined(false);
        } else if (incomingCall && session?.user?.id === incomingCall.recipientId) {
            console.log('User is receiver for incoming call:', incomingCall);
            setIsRingingModalOpen(true);
            setIsVideoModalOpen(false);
            setIsReceiver(true);
            setIsDeclined(false);
        } else if (callRinging && session?.user?.id === callRinging.callerId) {
            console.log('User is caller for ringing call:', callRinging);
            setIsRingingModalOpen(true);
            setIsVideoModalOpen(false);
            setIsReceiver(false);
            setIsDeclined(false);
        } else {
            console.log('Closing all modals');
            setIsRingingModalOpen(false);
            setIsVideoModalOpen(false);
            setIsReceiver(false);
            setIsDeclined(false);
        }
    }, [callRinging, incomingCall, session?.user?.id, isCallActive, localStream, remoteStream]);

    const handleAccept = () => {
        console.log('Handling accept call');
        acceptCall();
        setIsRingingModalOpen(false);
        setIsVideoModalOpen(true);
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
        }, 2000);
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
            <VideoCallModal
                isOpen={isVideoModalOpen && isCallActive}
                localStream={localStream}
                remoteStream={remoteStream}
                toggleAudioMute={toggleAudioMute}
                toggleVideoMute={toggleVideoMute}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                onHangUp={hangUp}
                callerName={callRinging?.callerName || incomingCall?.callerName || 'Unknown'}
            />
        </>
    );
};

export default VideoCallModalManager;