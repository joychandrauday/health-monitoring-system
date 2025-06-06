'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useMessages } from '@/hooks/useMessages';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    incomingCall: { callerId: string; callerName: string; appointmentId: string; recipientId: string } | null;
    callRinging: { appointmentId: string; callerId: string; recipientId: string; callerName: string } | null;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
    isOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        if (session?.user?.id) {
            const socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
                auth: { token: session?.user?.accessToken },
                transports: ['websocket', 'polling'],
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('receiveVideoCall', (data: { callerId: string; callerName: string; appointmentId: string; recipientId: string }) => {
                if (data.callerId !== session?.user?.id) {
                    console.log('Received incoming call:', data);
                    setIncomingCall(data);
                }
            });

            socketInstance.on('callRinging', (data: { appointmentId: string; callerId: string; recipientId: string; callerName: string }) => {
                if (data.callerId === session?.user?.id) {
                    console.log('Call is ringing:', data);
                    setCallRinging(data);
                }
            });

            socketInstance.on('callDeclined', (data: { appointmentId: string; recipientId: string }) => {
                if (data.recipientId !== session?.user?.id) {
                    console.log(`Call declined for appointment: ${data.appointmentId}`);
                    setCallRinging(null);
                    setIncomingCall(null);
                }
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.off('receiveVideoCall');
                socketInstance.off('callRinging');
                socketInstance.off('callDeclined');
                socketInstance.disconnect();
                setSocket(null);
            };
        }
    }, [session?.user?.accessToken, session?.user?.id]);

    const declineCall = (appointmentId: string, callerId: string, recipientId: string) => {
        if (socket) {
            socket.emit('declineVideoCall', { appointmentId, callerId, recipientId });
            console.log('Emitted declineVideoCall:', { appointmentId, callerId, recipientId });
            setIncomingCall(null);
            setCallRinging(null);
        }
    };

    const clearRinging = () => {
        setCallRinging(null);
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, incomingCall, callRinging, declineCall, clearRinging, isOnline }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};