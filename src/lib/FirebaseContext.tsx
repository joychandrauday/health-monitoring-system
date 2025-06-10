'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getDatabase, ref, onValue } from 'firebase/database';
import useSocket from '@/hooks/useSocket';
import { useMessages } from '@/hooks/useMessages';

// Define the context type
interface AppContextType {
    isConnected: boolean;
    incomingCall: { callerId: string; callerName: string; appointmentId: string; recipientId: string } | null;
    callRinging: { callerId: string; callerName: string; appointmentId: string; recipientId: string } | null;
    isOnline: (userId: string) => boolean;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Combined provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { socket } = useSocket();
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{
        callerId: string;
        callerName: string;
        appointmentId: string;
        recipientId: string;
    } | null>(null);
    const [callRinging, setCallRinging] = useState<{
        callerId: string;
        callerName: string;
        appointmentId: string;
        recipientId: string;
    } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { isOnline: socketIsOnline } = useMessages(session?.user?.id as string, socket);

    // Firebase setup for online users
    useEffect(() => {
        const db = getDatabase();
        const connectedRef = ref(db, '.info/connected');
        const usersRef = ref(db, 'onlineUsers');

        // Monitor Firebase connection state
        const unsubscribeConnected = onValue(connectedRef, (snap) => {
            setIsConnected(snap.val() === true);
        });

        // Monitor online users
        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            const users = snapshot.val() ? Object.keys(snapshot.val()) : [];
            setOnlineUsers(users);
        });

        // Cleanup
        return () => {
            unsubscribeConnected();
            unsubscribeUsers();
        };
    }, []);

    // Socket setup for call handling
    useEffect(() => {
        if (!session?.user?.id || !session?.user?.accessToken || !socket) {
            console.log('Missing user ID, access token, or socket, skipping socket setup');
            setIsConnected(false);
            return;
        }

        setIsConnected(true);

        // Handle incoming call
        socket.on('incomingCall', (data: { callerId: string; callerName: string; appointmentId: string; recipientId: string }) => {
            setIncomingCall(data);
            setCallRinging(data);
        });

        // Handle call declined
        socket.on('callDeclined', () => {
            setIncomingCall(null);
            setCallRinging(null);
        });

        // Handle socket errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            setIsConnected(false);
        });

        // Cleanup
        return () => {
            socket.off('incomingCall');
            socket.off('callDeclined');
            socket.off('error');
            socket.disconnect();
            setIsConnected(false);
        };
    }, [session?.user?.id, session?.user?.accessToken, socket]);

    // Check if a user is online (combines socket and Firebase)
    const isOnline = useCallback(
        (userId: string) => {
            return socketIsOnline(userId) || onlineUsers.includes(userId);
        },
        [socketIsOnline, onlineUsers]
    );

    // Decline a call
    const declineCall = useCallback(
        (appointmentId: string, callerId: string, recipientId: string) => {
            if (socket) {
                console.log('Emitting declineVideoCall:', { appointmentId, callerId, recipientId });
                socket.emit('declineVideoCall', { appointmentId, callerId, recipientId });
                setIncomingCall(null);
                setCallRinging(null);
            }
        },
        [socket]
    );

    // Clear ringing state
    const clearRinging = useCallback(() => {
        setIncomingCall(null);
        setCallRinging(null);
    }, []);

    return (
        <AppContext.Provider value={{ isConnected, incomingCall, callRinging, isOnline, declineCall, clearRinging }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};