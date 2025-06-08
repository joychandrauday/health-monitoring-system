'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useVideoChat } from '@/hooks/useVideoChat';
import { VideoCallModal } from './VideoCallModal';
import { useVideoCallContext } from '@/lib/VideoCallContext';

export const VideoCallModalWrapper: React.FC = () => {
    const { data: session } = useSession();
    const { callRinging, incomingCall } = useVideoCallContext();
    const {
        localStream,
        remoteStream,
        toggleAudioMute,
        toggleVideoMute,
        isAudioMuted,
        isVideoMuted,
        hangUp,
        isCallActive,
    } = useVideoChat();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        console.log('VideoCallModalWrapper state:', {
            isCallActive,
            hasLocalStream: !!localStream,
            hasRemoteStream: !!remoteStream,
            userId: session?.user?.id,
            callRinging,
            incomingCall,
        });

        if (isCallActive) {
            setIsVideoModalOpen(true);
            console.log('Opening VideoCallModal due to isCallActive');
        } else {
            setIsVideoModalOpen(false);
            console.log('Closing VideoCallModal');
        }
    }, [isCallActive, localStream, remoteStream, session?.user?.id, callRinging, incomingCall]);

    return (
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
    );
};

export default VideoCallModalWrapper;