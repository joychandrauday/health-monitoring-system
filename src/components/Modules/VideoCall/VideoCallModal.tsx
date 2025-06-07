'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone } from 'lucide-react';

interface VideoCallModalProps {
    isOpen: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    toggleAudioMute: () => void;
    toggleVideoMute: () => void;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    onHangUp: () => void;
    callerName: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
    isOpen,
    localStream,
    remoteStream,
    toggleAudioMute,
    toggleVideoMute,
    isAudioMuted,
    isVideoMuted,
    onHangUp,
    callerName,
}) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        console.log('VideoCallModal streams:', {
            hasLocalStream: !!localStream,
            hasRemoteStream: !!remoteStream,
        });
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(err => console.error('Local video play error:', err));
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(err => console.error('Remote video play error:', err));
        }
    }, [localStream, remoteStream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                <div className="flex-1 relative">
                    {/* Remote Video (Main) */}
                    <div className="absolute inset-0">
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <p className="text-white text-lg">Waiting for {callerName}...</p>
                            </div>
                        )}
                    </div>
                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute bottom-4 right-4 w-1/4 h-1/4 bg-black border-2 border-white rounded-lg overflow-hidden">
                        {localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <p className="text-white text-sm">No video</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-center gap-4 p-4 bg-gray-900">
                    <Button
                        variant="outline"
                        className="bg-white/20 text-white"
                        onClick={toggleAudioMute}
                        disabled={!localStream?.getAudioTracks().length}
                    >
                        {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-white/20 text-white"
                        onClick={toggleVideoMute}
                        disabled={!localStream?.getVideoTracks().length}
                    >
                        {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={onHangUp}
                    >
                        <Phone className="h-5 w-4" />
                        Hang Up
                    </Button>
                </div>
            </div>
        </div>
    );
};