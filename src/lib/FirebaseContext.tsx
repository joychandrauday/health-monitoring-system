'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

interface AppContextType {
    isConnected: boolean;
    isOnline: (userId: string) => boolean;
    declineCall: (appointmentId: string, callerId: string, recipientId: string) => void;
    clearRinging: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fallback context to prevent errors during initialization
const fallbackContext: AppContextType = {
    isConnected: false,
    isOnline: () => false,
    declineCall: () => console.warn('declineCall called before Firebase initialization'),
    clearRinging: () => console.warn('clearRinging called before Firebase initialization'),
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [app, setApp] = useState<FirebaseApp | null>(null);
    const [db, setDb] = useState<Firestore | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize Firebase on client side
    useEffect(() => {
        if (typeof window === 'undefined') return; // Skip on server

        let firebaseApp: FirebaseApp;
        if (!getApps().length) {
            try {
                firebaseApp = initializeApp(firebaseConfig);
                console.log('Firebase initialized');
            } catch (error) {
                console.error('Firebase initialization error:', error);
                setIsInitialized(true); // Mark as initialized to render fallback
                return;
            }
        } else {
            firebaseApp = getApps()[0];
            console.log('Using existing Firebase app');
        }

        const firestore = getFirestore(firebaseApp);
        setApp(firebaseApp);
        setDb(firestore);
        setIsConnected(true);
        setIsInitialized(true);

        return () => {
            setIsConnected(false);
            setIsInitialized(false);
        };
    }, []);

    // Track user online status
    useEffect(() => {
        if (!db || !session?.user?.id) return;

        const userStatusRef = doc(db, 'userStatus', session.user.id);

        // Set user as online
        setDoc(userStatusRef, { online: true, lastSeen: new Date().toISOString() }, { merge: true })
            .catch((error) => console.error('Error setting user online:', error));

        // Listen for online users
        const unsubscribe = onSnapshot(doc(db, 'onlineUsers', 'list'), (snapshot) => {
            const data = snapshot.data();
            if (data?.users) {
                setOnlineUsers(data.users);
            }
        });

        // Cleanup: Set user as offline
        return () => {
            setDoc(userStatusRef, { online: false, lastSeen: new Date().toISOString() }, { merge: true })
                .catch((error) => console.error('Error setting user offline:', error));
            unsubscribe();
        };
    }, [db, session?.user?.id]);

    const isOnline = useCallback(
        (userId: string) => {
            return onlineUsers.includes(userId);
        },
        [onlineUsers]
    );

    const declineCall = useCallback(
        async (appointmentId: string, callerId: string, recipientId: string) => {
            if (!db) {
                console.error('Firestore not initialized');
                return;
            }
            console.log('Declining call:', { appointmentId, callerId, recipientId });
            try {
                const callRef = doc(db, 'calls', appointmentId);
                await setDoc(callRef, { status: 'declined', updatedAt: new Date().toISOString() }, { merge: true });
            } catch (error) {
                console.error('Error declining call:', error);
            }
        },
        [db]
    );

    const clearRinging = useCallback(() => {
        console.log('Clearing ringing state');
    }, []);

    // Provide fallback context until initialized
    const contextValue = isInitialized && app && db ? { isConnected, isOnline, declineCall, clearRinging } : fallbackContext;

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};