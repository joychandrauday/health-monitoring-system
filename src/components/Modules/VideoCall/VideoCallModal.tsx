/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoCallModalProps {
    isOpen: boolean;
    callerName: string;
    onAccept: () => void;
    onDecline: () => void;
    localStream: MediaStream | null;
    remoteStream?: MediaStream | null;
    onHangUp: () => void;
    toggleAudioMute: () => void;
    toggleVideoMute: () => void;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
    isOpen,
    callerName,
    onAccept,
    onDecline,
    localStream,
    remoteStream,
    onHangUp,
    toggleAudioMute,
    toggleVideoMute,
    isAudioMuted,
    isVideoMuted,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [noRemoteStream, setNoRemoteStream] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (remoteStream) {
            setNoRemoteStream(false);
        } else if (isOpen && !remoteStream) {
            timeout = setTimeout(() => {
                console.warn('No remote stream received after 10 seconds');
                setNoRemoteStream(true);
            }, 10000);
        }

        if (isOpen && audioRef.current && !remoteStream) {
            audioRef.current.loop = true;
            audioRef.current.play().catch((error) => {
                console.error('Failed to play ringtone:', error);
            });
        }
        if (localVideoRef.current && localStream && localStream.getVideoTracks().length > 0) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch((error) => {
                console.error('Failed to play local video stream:', error);
            });
        }
        if (remoteVideoRef.current && remoteStream && remoteStream.getVideoTracks().length > 0) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch((error) => {
                console.error('Failed to play remote video stream:', error);
            });
        }

        return () => {
            if (timeout) clearTimeout(timeout);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                console.log('Ringtone paused and reset');
            }
        };
    }, [isOpen, localStream, remoteStream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-2xl">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        {remoteStream ? `Video Call with ${callerName}` : 'Incoming Video Call'}
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        {localStream && localStream.getVideoTracks().length > 0 ? (
                            <div className="relative w-full max-w-md">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    className="w-full rounded-lg"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                                <p className="text-sm text-gray-600 mt-2">You</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-md bg-gray-200 rounded-lg flex items-center justify-center h-40">
                                <p className="text-gray-600">No local video</p>
                            </div>
                        )}
                        {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
                            <div className="relative w-full max-w-md">
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    className="w-full rounded-lg"
                                />
                                <p className="text-sm text-gray-600 mt-2">{callerName}</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-md bg-gray-200 rounded-lg flex items-center justify-center h-40">
                                <p className="text-gray-600">{noRemoteStream ? 'No video from other user' : 'Waiting for video...'}</p>
                            </div>
                        )}
                    </div>
                    {!remoteStream && (
                        <p className="text-gray-600 my-6">From {callerName}</p>
                    )}
                    <div className="flex gap-4 mt-4">
                        {remoteStream ? (
                            <>
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
                                <Button
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
                                    onClick={onHangUp}
                                >
                                    Hang Up
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                                    onClick={onAccept}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50 px-6 py-2"
                                    onClick={onDecline}
                                >
                                    Decline
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <audio ref={audioRef} src="/ringtone.mp3" />
        </div>
    );
};