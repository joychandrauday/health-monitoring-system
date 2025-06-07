/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

interface ContextType {
    isConnected: boolean;
    incomingCall: { callerId: string; callerName: string; appointmentId: string; recipientId: string } | null;
    callRinging: { appointmentId: string; callerId: string; recipientId: string; callerName: string; } | null;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
    isOnline: (userId: string) => boolean;
}

const AppContext = createContext<ContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { socket } = useSocket();
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{
        callerId: string;
        callerName: string;
        appointmentId: string;
        recipientId: string;
    } | null>(null);
    const [callRinging, setCallRinging] = useState(null);
    const { isOnline } = useMessages(session?.user?.id as string, socket);

    useEffect(() => {
        if (!session?.user?.id || !session?.user?.accessToken) {
            console.log('Missing user ID or access token, skipping socket setup');
            return;
        }

        setIsConnected(true);

        return () => {
            setIsConnected(false);
        };
    }, [session?.user?.accessToken, session?.user?.id]);

    const declineCall = (appointmentId: string, callerId: string, recipientId: string) => {
        if (socket) {
            console.log('Emitting declineVideoCall:', { appointmentId, callerId, recipientId });
            socket.emit('declineVideoCall', { appointmentId, callerId, recipientId });
            setIncomingCall(null);
            setCallRinging(null);
        }
    };

    const clearRinging = () => {
        setCall(null);
    };

    return (
        <AppContext.Provider value={{ isConnected, incomingCall, callRinging, declineCall, clearRinging, isOnline }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within a FirebaseProvider');
    }
    return context;
};

function setCall(arg0: null) {
    throw new Error('Function not implemented.');
}
