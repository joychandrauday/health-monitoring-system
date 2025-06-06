'use client';

import { useSession } from 'next-auth/react';
import { useSocketContext } from '@/lib/SocketContext';
import { VideoCallModal } from '@/components/Modules/VideoCall/VideoCallModal';
import { useVideoChat } from '@/hooks/useVideoChat';
import { useCallback, useMemo } from 'react';


export const GlobalVideoCallHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { incomingCall } = useSocketContext();
    const {
        localStream,
        remoteStream,
        acceptCall,
        declineCall,
        hangUp,
        toggleAudioMute,
        toggleVideoMute,
        isAudioMuted,
        isVideoMuted,
        error
    } = useVideoChat();

    // Memoize callbacks to prevent unnecessary re-renders
    const memoizedAcceptCall = useCallback(() => acceptCall(), [acceptCall]);
    const memoizedDeclineCall = useCallback(() => declineCall(), [declineCall]);
    const memoizedHangUp = useCallback(() => hangUp(), [hangUp]);
    const memoizedToggleAudioMute = useCallback(() => toggleAudioMute(), [toggleAudioMute]);
    const memoizedToggleVideoMute = useCallback(() => toggleVideoMute(), [toggleVideoMute]);


    // Memoize modal visibility to avoid recomputation
    const isModalOpen = useMemo(() => !!incomingCall && !!session?.user?.id, [incomingCall, session]);



    return (
        <>
            {children}
            {isModalOpen && (
                <VideoCallModal
                    isOpen={isModalOpen}
                    callerName={incomingCall?.callerName ?? 'Unknown Caller'}
                    onAccept={memoizedAcceptCall}
                    onDecline={memoizedDeclineCall}
                    onHangUp={memoizedHangUp}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    toggleAudioMute={memoizedToggleAudioMute}
                    toggleVideoMute={memoizedToggleVideoMute}
                    isAudioMuted={isAudioMuted}
                    isVideoMuted={isVideoMuted}
                />
            )}
        </>
    );
};