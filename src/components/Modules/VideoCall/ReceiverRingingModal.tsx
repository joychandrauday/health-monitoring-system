/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

interface ReceiverRingingModalProps {
    isOpen: boolean;
    callerName: string;
    onAccept: () => void;
    onCancel: () => void;
    isDeclined: boolean;
    localStream: MediaStream | null;
    toggleAudioMute: () => void;
    toggleVideoMute: () => void;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
}

export const ReceiverRingingModal: React.FC<ReceiverRingingModalProps> = ({
    isOpen,
    callerName,
    onAccept,
    onCancel,
    isDeclined,
    localStream,
    toggleAudioMute,
    toggleVideoMute,
    isAudioMuted,
    isVideoMuted,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        console.log('ReceiverRingingModal props:', {
            isOpen,
            callerName,
            isDeclined,
            hasLocalStream: !!localStream,
        });
        if (isOpen && !isDeclined && audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch((error) => {
                console.error('Failed to play ringtone:', error);
            });
        }
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
            videoRef.current.play().catch((error) => {
                console.error('Failed to play video stream:', error);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                console.log('Ringtone paused');
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                console.log('Cleared video stream');
            }
        };
    }, [isOpen, isDeclined, localStream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full bg-blue-500 flex items-center justify-center">
                            <Phone className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {isDeclined ? 'Call Declined' : 'Incoming Call'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {isDeclined ? `Call declined` : `Incoming call from ${callerName}`}
                    </p>
                    {localStream ? (
                        <div className="relative w-full max-w-xs mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full rounded-lg"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/80"
                                    onClick={toggleAudioMute}
                                    disabled={!localStream?.getAudioTracks().length}
                                >
                                    {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/80"
                                    onClick={toggleVideoMute}
                                    disabled={!localStream?.getVideoTracks().length}
                                >
                                    {isVideoMuted ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-xs mb-4 bg-gray-200 rounded-lg flex items-center justify-center h-36">
                            <p className="text-gray-600">No video available</p>
                        </div>
                    )}
                    {isDeclined ? (
                        <Button
                            variant="outline"
                            className="border-gray-600 text-gray-800 hover:bg-gray-100 px-4 py-2"
                            onClick={() => {
                                console.log('Close button clicked');
                                onCancel();
                            }}
                        >
                            Close
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                variant="default"
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                                onClick={() => {
                                    console.log('Accept Call button clicked');
                                    onAccept();
                                }}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-100 px-4 py-2"
                                onClick={() => {
                                    console.log('Decline Call button clicked');
                                    onCancel();
                                }}
                            >
                                Decline
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <audio ref={audioRef} src="/assets/ringtone.mp3" />
        </div>
    );
};