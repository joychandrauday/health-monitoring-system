'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useMessages } from '@/hooks/useMessages';

interface VideoCallContextType {
    socket: Socket | null;
    isConnected: boolean;
    incomingCall: { callerId: string; callerName: string; appointmentId: string; recipientId: string } | null;
    callRinging: { appointmentId: string; callerId: string; recipientId: string; callerName: string } | null;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
    isOnline: (userId: string) => boolean;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{
        callerId: string;
        callerName: string;
        appointmentId: string;
        recipientId: string;
    } | null>(null);
    const [callRinging, setCallRinging] = useState<{
        appointmentId: string;
        callerId: string;
        recipientId: string;
        callerName: string;
    } | null>(null);
    const { isOnline } = useMessages(session?.user?.id as string, socket);

    useEffect(() => {
        if (!session?.user?.id || !session?.user?.accessToken) {
            console.log('Missing user ID or access token, skipping socket setup');
            return;
        }

        const socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
            auth: { token: session?.user?.accessToken },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            setIncomingCall(null);
            setCallRinging(null);
        });

        socketInstance.on('startVideoCall', (data) => {
            if (!data.appointmentId || !data.callerId || !data.recipientId || !data.callerName) {
                console.error('Invalid startVideoCall data:', data);
                return;
            }
            console.log('Received startVideoCall:', data);
            setIncomingCall({
                callerId: data.callerId,
                callerName: data.callerName,
                appointmentId: data.appointmentId,
                recipientId: data.recipientId,
            });
        });

        socketInstance.on('callRinging', (data) => {
            if (!data.appointmentId || !data.callerId || !data.recipientId || !data.callerName) {
                console.error('Invalid callRinging data:', data);
                return;
            }
            console.log('Received callRinging:', data);
            setCallRinging({
                appointmentId: data.appointmentId,
                callerId: data.callerId,
                recipientId: data.recipientId,
                callerName: data.callerName,
            });
        });

        socketInstance.on('callDeclined', (data) => {
            if (!data.appointmentId) {
                console.error('Invalid callDeclined data:', data);
                return;
            }
            console.log('Received callDeclined:', data);
            setCallRinging(null);
            setIncomingCall(null);
        });

        socketInstance.on('callError', (data) => {
            console.error('Received callError:', data);
            setCallRinging(null);
            setIncomingCall(null);
        });

        setSocket(socketInstance);

        return () => {
            console.log('Cleaning up socket');
            socketInstance.off('connect');
            socketInstance.off('disconnect');
            socketInstance.off('startVideoCall');
            socketInstance.off('callRinging');
            socketInstance.off('callDeclined');
            socketInstance.off('callError');
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
            setIncomingCall(null);
            setCallRinging(null);
        };
    }, [session?.user?.id, session?.user?.accessToken]);

    const declineCall = (appointmentId: string, callerId: string, recipientId: string) => {
        if (socket) {
            console.log('Emitting declineVideoCall:', { appointmentId, callerId, recipientId });
            socket.emit('declineVideoCall', { appointmentId, callerId, recipientId });
            setIncomingCall(null);
            setCallRinging(null);
        }
    };

    const clearRinging = () => {
        console.log('Clearing ringing state');
        setCallRinging(null);
        setIncomingCall(null);
    };

    return (
        <VideoCallContext.Provider
            value={{
                socket,
                isConnected,
                incomingCall,
                callRinging,
                declineCall,
                clearRinging,
                isOnline,
            }}
        >
            {children}
        </VideoCallContext.Provider>
    );
};

export const useVideoCallContext = () => {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error('useVideoCallContext must be used within a VideoCallProvider');
    }
    return context;
};