'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useMessages } from '@/hooks/useMessages';

interface CallData {
    appointmentId: string;
    callerId: string;
    recipientId: string;
    callerName: string;
}

interface VideoCallContextType {
    socket: Socket | null;
    isConnected: boolean;
    incomingCall: CallData | null;
    callRinging: CallData | null;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
    isOnline: (userId: string) => boolean;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [callRinging, setCallRinging] = useState<CallData | null>(null);
    const userId = session?.user?.id;
    const { isOnline } = useMessages(userId ?? '', socket);

    useEffect(() => {
        if (!userId || !session?.user?.accessToken) {
            console.log('No userId or accessToken, skipping socket setup');
            return;
        }

        const socketInstance = io(`${process.env.REACT_APP_STREAMING_URL || 'http://localhost:5000'}`, {
            auth: { token: session.user.accessToken },
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

        socketInstance.on('startVideoCall', (data: CallData) => {
            if (!data.appointmentId || !data.callerId || !data.recipientId || !data.callerName) {
                console.error('Invalid startVideoCall data:', data);
                return;
            }
            console.log('Received startVideoCall:', data);
            setIncomingCall(data);
        });

        socketInstance.on('callRinging', (data: CallData) => {
            if (!data.appointmentId || !data.callerId || !data.recipientId || !data.callerName) {
                console.error('Invalid callRinging data:', data);
                return;
            }
            console.log('Received callRinging:', data);
            setCallRinging(data);
        });

        socketInstance.on('callDeclined', (data: { appointmentId: string }) => {
            if (!data.appointmentId) {
                console.error('Invalid callDeclined data:', data);
                return;
            }
            console.log('Received callDeclined:', data);
            setCallRinging(null);
            setIncomingCall(null);
        });

        socketInstance.on('callError', (data: { message: string }) => {
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
    }, [userId, session?.user?.accessToken]);

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