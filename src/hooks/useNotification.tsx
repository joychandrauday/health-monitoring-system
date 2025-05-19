/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IMedicalNotification, Vital } from '@/types';
import { saveNotification, getNotifications, clearNotifications, acknowledgeNotification } from '@/service/notification/Notification';
import { useSession } from 'next-auth/react';
import useSocket from '@/hooks/useSocket';
import { FaBell, FaCheckCircle } from 'react-icons/fa';

interface VitalAlert {
    sender: string;
    vitalId: string;
    message: string;
    vital: Vital;
}

interface VitalNotification {
    sender: string;
    vitalId: string;
    vital: Vital;
}

interface AcknowledgmentNotification {
    sender: string;
    notificationId: string;
    message: string;
    notification: IMedicalNotification;
}

export const useNotifications = () => {
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<IMedicalNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) {
                console.log('No session, skipping notification fetch');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const fetchedNotifications = await getNotifications({
                    userId: session?.user?.id as string,
                    token: session?.user?.accessToken as string,
                });
                console.log('Fetched notifications:', fetchedNotifications); // Debug log
                setNotifications(fetchedNotifications || []);
            } catch (error: any) {
                console.error('Error fetching notifications:', error.message);
                toast.error(error.message || 'Failed to load notifications', {
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #D32F2F',
                    },
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [session?.user?.accessToken, session?.user?.id]);

    // Socket setup
    useEffect(() => {
        if (!socket || !isConnected || !session?.user?.id || !session?.user?.accessToken) {
            console.log('Socket not ready for notifications:', {
                socket: !!socket,
                isConnected,
                userId: session?.user?.id,
                accessToken: !!session?.user?.accessToken,
            });
            return;
        }

        socket.emit('joinRoom', { userId: session?.user?.id as string });
        console.log(`Joined room: user:${session?.user?.id as string}`);

        const handleConnectError = (error: Error) => {
            console.error('Socket connection error:', error.message);
            toast.error('Failed to connect to real-time notifications', {
                duration: 5000,
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
        };

        const handleVitalAlert = async (data: VitalAlert) => {
            if (!data.vital) {
                console.error('Invalid vital alert data:', data);
                return;
            }

            const newNotification: Omit<IMedicalNotification, '_id' | 'acknowledged'> = {
                sender: data.vital.patientId as string,
                receiver: data.vital.doctorId as string,
                type: 'vital',
                message: data.message,
                url: `/doctor/dashboard/vitals/${data.sender}/${data.vitalId}`,
                timestamp: data.vital.timestamp ? new Date(data.vital.timestamp) : new Date(),
            };

            setNotifications((prev) => [
                { ...newNotification, _id: data.vitalId, acknowledged: false },
                ...prev,
            ].slice(0, 20));

            try {
                const savedNotification = await saveNotification(newNotification, session?.user?.accessToken as string);
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === data.vitalId ? savedNotification : notif
                    )
                );
            } catch (error: any) {
                console.error('Error saving alert:', error.message);
                toast.error(error.message || 'Failed to save alert', {
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #D32F2F',
                    },
                });
            }

            toast.error(`${data.message} (Sender ID: ${data.sender})`, {
                duration: 5000,
                icon: <FaBell className="text-red-500" />,
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
        };

        const handleVitalNew = async (data: VitalNotification) => {
            if (!data.vital) {
                console.error('Invalid vital notification data:', data);
                return;
            }
            console.log(data);
            const newNotification: Omit<IMedicalNotification, '_id' | 'acknowledged'> = {
                sender: data.vital.patientId as string,
                receiver: data.vital.doctorId as string,
                type: 'vital',
                message: `New vitals submitted.`,
                url: `/doctor/dashboard/vitals/${data.vital.patientId}/${data.vitalId}`,
                timestamp: data.vital.timestamp ? new Date(data.vital.timestamp) : new Date(),
            };

            setNotifications((prev) => [
                { ...newNotification, _id: data.vitalId, acknowledged: false },
                ...prev,
            ].slice(0, 20));

            try {
                const savedNotification = await saveNotification(newNotification, session?.user?.accessToken as string);
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === data.vitalId ? savedNotification : notif
                    )
                );
            } catch (error: any) {
                console.error('Error saving notification:', error.message);
                toast.error(error.message || 'Failed to save notification', {
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #D32F2F',
                    },
                });
            }

            toast.success(
                <div>
                    <strong>New vitals submitted (Sender ID: {data.sender})</strong>
                    <ul className="list-disc pl-4 mt-1">
                        {data.vital.heartRate && <li>Heart Rate: {data.vital.heartRate} bpm</li>}
                        {data.vital.bloodPressure && (
                            <li>
                                BP: {data.vital.bloodPressure.systolic}/{data.vital.bloodPressure.diastolic} mmHg
                            </li>
                        )}
                        {data.vital.glucoseLevel && <li>Glucose: {data.vital.glucoseLevel} mg/dL</li>}
                        {data.vital.oxygenSaturation && <li>O2 Sat: {data.vital.oxygenSaturation}%</li>}
                        {data.vital.temperature && <li>Temp: {data.vital.temperature}°C</li>}
                        {data.vital.respiratoryRate && <li>Resp Rate: {data.vital.respiratoryRate}/min</li>}
                        {data.vital.painLevel && <li>Pain: {data.vital.painLevel}/10</li>}
                        {data.vital.injury?.type && data.vital.injury.type !== 'none' && (
                            <li>Injury: {data.vital.injury.type}</li>
                        )}
                        {data.vital.visuals?.length ? <li>Images: {data.vital.visuals.length}</li> : null}
                    </ul>
                </div>,
                {
                    duration: 6000,
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #2E7D32',
                        maxWidth: '500px',
                    },
                }
            );
        };

        const handleNotificationAcknowledged = async (data: AcknowledgmentNotification) => {
            if (data.notification.receiver === session?.user?.id as string) {
                setNotifications((prev) => [
                    { ...data.notification, timestamp: new Date(data.notification.timestamp) },
                    ...prev,
                ].slice(0, 20));

                try {
                    const savedNotification = await saveNotification(data.notification, session?.user?.accessToken as string);
                    setNotifications((prev) =>
                        prev.map((notif) =>
                            notif._id === data.notificationId ? savedNotification : notif
                        )
                    );
                } catch (error: any) {
                    console.error('Error saving acknowledgment notification:', error.message);
                    toast.error(error.message || 'Failed to save acknowledgment notification', {
                        style: {
                            background: '#F5F7FA',
                            color: '#37474F',
                            border: '1px solid #D32F2F',
                        },
                    });
                }

                toast.success(data.message, {
                    duration: 5000,
                    icon: <FaCheckCircle className="text-green-500" />,
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #2E7D32',
                    },
                });
            }
        };

        socket.on('connect_error', handleConnectError);
        socket.on('vital:alert', handleVitalAlert);
        socket.on('vital:new', handleVitalNew);
        socket.on('notification:acknowledged', handleNotificationAcknowledged);

        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('vital:alert', handleVitalAlert);
            socket.off('vital:new', handleVitalNew);
            socket.off('notification:acknowledged', handleNotificationAcknowledged);
        };
    }, [socket, isConnected, session?.user?.id, session?.user?.accessToken]);

    const clearNotificationsHandler = async () => {
        if (!session?.user?.accessToken) {
            toast.error('No valid session', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
            return;
        }

        try {
            await clearNotifications(session?.user?.accessToken as string);
            setNotifications([]);
            toast.success('Notifications cleared', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #2E7D32',
                },
            });
        } catch (error: any) {
            console.error('Error clearing notifications:', error.message);
            toast.error(error.message || 'Failed to clear notifications', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
        }
    };

    const acknowledgeNotificationHandler = async (notificationId: string) => {
        if (!session?.user?.accessToken) {
            toast.error('No valid session', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
            return;
        }

        try {
            const updatedNotification = await acknowledgeNotification(notificationId, session?.user?.accessToken as string);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId
                        ? { ...updatedNotification, timestamp: new Date(updatedNotification.timestamp) }
                        : notif
                )
            );
            toast.success('Notification acknowledged', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #2E7D32',
                },
            });
        } catch (error: any) {
            console.error('Error acknowledging notification:', error.message);
            toast.error(error.message || 'Failed to acknowledge notification', {
                style: {
                    background: '#F5F7FA',
                    color: '#37474F',
                    border: '1px solid #D32F2F',
                },
            });
        }
    };

    return {
        notifications: notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        isLoading,
        clearNotifications: clearNotificationsHandler,
        acknowledgeNotification: acknowledgeNotificationHandler,
    };
};