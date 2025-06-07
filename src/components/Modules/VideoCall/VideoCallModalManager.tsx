'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useVideoChat } from '@/hooks/useVideoChat';
import { useAppContext } from '@/lib/FirebaseContext';
import { useVideoCallContext } from '@/lib/VideoCallContext';
import { CallRingingModal } from './CallRingingModal';

export const VideoCallModalManager: React.FC = () => {
    const { data: session } = useSession();
    const { callRinging, incomingCall } = useVideoCallContext();
    const { declineCall: contextDeclineCall } = useAppContext();
    const { localStream, toggleAudioMute, toggleVideoMute, isAudioMuted, isVideoMuted, acceptCall, declineCall, isCallActive } = useVideoChat();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isReceiver, setIsReceiver] = useState(false);

    useEffect(() => {
        console.log('VideoCallModalManager state:', {
            callRinging,
            incomingCall,
            userId: session?.user?.id,
            isCallActive,
        });
        if (incomingCall && session?.user?.id === incomingCall.recipientId) {
            console.log('User is receiver for incoming call:', incomingCall);
            setIsModalOpen(true);
            setIsReceiver(true);
            setIsDeclined(false);
        } else if (callRinging && session?.user?.id === callRinging.callerId) {
            console.log('User is caller for ringing call:', callRinging);
            setIsModalOpen(true);
            setIsReceiver(false);
            setIsDeclined(false);
        } else {
            console.log('Closing modal: No relevant call state');
            setIsModalOpen(false);
            setIsReceiver(false);
        }
    }, [callRinging, incomingCall, session?.user?.id, isCallActive]);

    const handleAccept = () => {
        console.log('Handling accept call');
        acceptCall();
        setIsModalOpen(false);
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
            setIsModalOpen(false);
            setIsDeclined(false);
        }, 2000);
    };

    return (
        <CallRingingModal
            isOpen={isModalOpen && !isCallActive}
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
    );
};