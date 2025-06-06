'use client';

import { useSession } from 'next-auth/react';
import { useSocketContext } from '@/lib/SocketContext';
import { VideoCallModal } from '@/components/Modules/VideoCall/VideoCallModal';
import { useVideoChat } from '@/hooks/useVideoChat';
import { useCallback, useMemo } from 'react';

// Error component for fallback UI
const ErrorFallback: React.FC<{ message: string }> = ({ message }) => (
    <div role="alert" style={{ color: 'red', padding: '10px' }}>
        {message}
    </div>
);

export const GlobalVideoCallHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, status } = useSession();
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
        error: videoChatError,
    } = useVideoChat();

    // Memoize callbacks to prevent unnecessary re-renders
    const memoizedAcceptCall = useCallback(() => acceptCall(), [acceptCall]);
    const memoizedDeclineCall = useCallback(() => declineCall(), [declineCall]);
    const memoizedHangUp = useCallback(() => hangUp(), [hangUp]);
    const memoizedToggleAudioMute = useCallback(() => toggleAudioMute(), [toggleAudioMute]);
    const memoizedToggleVideoMute = useCallback(() => toggleVideoMute(), [toggleVideoMute]);

    // Check for loading or error states
    const isLoading = status === 'loading';
    const hasError = videoChatError || !session?.user?.id;

    // Memoize modal visibility to avoid recomputation
    const isModalOpen = useMemo(() => !!incomingCall && !!session?.user?.id, [incomingCall, session]);

    if (isLoading) {
        return <div>Loading session...</div>;
    }

    if (hasError) {
        return <ErrorFallback message={videoChatError || 'User not authenticated'} />;
    }

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