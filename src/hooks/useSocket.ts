import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

const useSocket = () => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        console.log(socketUrl);
        if (!socketUrl) {
            console.error('Socket URL is not defined in environment variables');
            return;
        }

        console.log('Connecting to Socket.io at:', socketUrl);

        const socketIo = io(socketUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            auth: {
                token: session?.user?.accessToken,
            },
        });

        socketIo.on('connect', () => {
            console.log(`✅ Socket.io connected: ${socketIo.id}`);
            setIsConnected(true);
            if (session?.user?.id && session?.user?.role) {
                const roomEvent = session.user.role === 'patient' ? 'joinPatientRoom' : 'joinDoctorRoom';
                const roomData = session.user.role === 'patient'
                    ? { patientId: session.user.id }
                    : { doctorId: session.user.id };
                socketIo.emit(roomEvent, roomData);
                console.log(`Emitted ${roomEvent} with:`, roomData);
            }
        });

        socketIo.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error.message, error);
            setIsConnected(false);
        });

        socketIo.on('reconnect', (attempt) => {
            console.log(`✅ Socket.io reconnected after ${attempt} attempts`);
            setIsConnected(true);
            if (session?.user?.id && session?.user?.role) {
                const roomEvent = session.user.role === 'patient' ? 'joinPatientRoom' : 'joinDoctorRoom';
                const roomData = session.user.role === 'patient'
                    ? { patientId: session.user.id }
                    : { doctorId: session.user.id };
                socketIo.emit(roomEvent, roomData);
                console.log(`Re-emitted ${roomEvent} with:`, roomData);
            }
        });

        socketIo.on('reconnect_failed', () => {
            console.error('Socket.io reconnection failed');
            setIsConnected(false);
        });

        socketIo.on('disconnect', (reason) => {
            console.log(`Socket.io disconnected: ${reason}`);
            setIsConnected(false);
        });

        setSocket(socketIo);

        return () => {
            socketIo.removeAllListeners();
            socketIo.disconnect();
            console.log('Socket.io client disconnected');
        };
    }, [session?.user?.id, session?.user?.role, session?.user?.accessToken]);

    return { socket, isConnected };
};

export default useSocket;