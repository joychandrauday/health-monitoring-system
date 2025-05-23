/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IMedicalNotification, Vital } from '@/types';
import { getNotifications, clearNotifications, acknowledgeNotification } from '@/service/notification/Notification';
import { useSession } from 'next-auth/react';
import useSocket from '@/hooks/useSocket';
import { FaCheckCircle } from 'react-icons/fa';

interface VitalNotification {
    sender: string;
    vitalId: string;
    vital: Vital;
    message?: string;
    notification: IMedicalNotification;
}

interface FeedbackNotification {
    sender: string;
    vitalId: string;
    message: string;
    vital: Vital;
    notification: IMedicalNotification;
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
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const fetchedNotifications = await getNotifications({
                    userId: session.user.id as string,
                    token: session.user.accessToken as string,
                });

                setNotifications(fetchedNotifications);
            } catch (error: any) {
                console.error('Error fetching notifications:', error.message, error);
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
    }, [session?.user?.id, session?.user?.accessToken]);

    // Socket setup
    useEffect(() => {
        if (!socket || !isConnected || !session?.user?.id || !session?.user?.accessToken) {
            console.log('Socket not ready for notifications:', {
                socket: !!socket,
                isConnected,
                userId: session?.user?.id,
                accessToken: session?.user?.accessToken ? 'Present' : 'Missing',
            });
            return;
        }

        // Join appropriate rooms based on user role
        const userId = session?.user?.id as string;
        const userRole = session?.user?.role; // Assuming session includes role (e.g., 'patient' or 'doctor')
        const rooms = [];
        if (userRole === 'patient') {
            rooms.push(`patient:${userId}`);
        } else if (userRole === 'doctor') {
            rooms.push(`doctor:${userId}`);
        }
        // Also join user:${userId} for compatibility with other events
        rooms.push(`user:${userId}`);

        rooms.forEach((room) => {
            socket.emit('joinRoom', { room });
            console.log(`Joined room: ${room}`);
        });

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

        const handleVitalNew = (data: VitalNotification) => {
            if (!data.vital || data.vital.doctorId !== session?.user?.id) {
                console.log('Ignoring vital:new (not relevant to this user):', data);
                return;
            }

            const { notification } = data;

            // Check for critical conditions (for UI purposes only)
            let message = notification.message;
            let isCritical = false;

            if (data.vital.heartRate && (data.vital.heartRate > 100 || data.vital.heartRate < 60)) {
                message = `Critical Heart Rate: ${data.vital.heartRate} bpm`;
                isCritical = true;
            } else if (data.vital.bloodPressure && (data.vital.bloodPressure.systolic > 140 || data.vital.bloodPressure.diastolic > 90)) {
                message = `Critical BP: ${data.vital.bloodPressure.systolic}/${data.vital.bloodPressure.diastolic} mmHg`;
                isCritical = true;
            }

            // Update state with the backend-provided notification
            setNotifications((prev) => [
                { ...notification, acknowledged: false, timestamp: new Date(notification.timestamp) },
                ...prev.filter((notif) => notif._id !== notification._id),
            ].slice(0, 20));

            // Show toast
            toast.success(
                <div>
                    <strong>{isCritical ? 'Critical Vitals Submitted' : 'New Vitals Submitted'} (Sender ID: {data.sender})</strong>
                    <p>{message}</p>
                    <ul className="list-disc pl-4 mt-1">
                        {data.vital.heartRate && <li>Heart Rate: {data.vital.heartRate} bpm</li>}
                        {data.vital.bloodPressure && (
                            <li>BP: {data.vital.bloodPressure.systolic}/{data.vital.bloodPressure.diastolic} mmHg</li>
                        )}
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

        const handleVitalFeedback = (data: FeedbackNotification) => {

            const { notification, message } = data;

            // Update notifications state
            setNotifications((prev) => [
                { ...notification, acknowledged: false, timestamp: new Date(notification.timestamp) },
                ...prev.filter((notif) => notif._id !== notification._id),
            ].slice(0, 20));

            // Show toast
            toast.success(
                <div>
                    <strong>Vital Feedback Received (Sender ID: {data.sender})</strong>
                    <p>{message}</p>
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

        const handleNotificationAcknowledged = (data: AcknowledgmentNotification) => {

            try {
                // Add the new acknowledgment notification to the state
                const newNotification = {
                    ...data.notification,
                    timestamp: new Date(data.notification.timestamp),
                };
                setNotifications((prev) => [
                    newNotification,
                    ...prev.filter((notif) => notif._id !== newNotification._id),
                ].slice(0, 20));

                toast.success(data.message, {
                    duration: 5000,
                    icon: <FaCheckCircle className="text-green-500" />,
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #2E7D32',
                    },
                });
            } catch (error: any) {
                console.error('Error processing acknowledgment notification:', error.message);
                toast.error(error.message || 'Failed to process acknowledgment notification', {
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #D32F2F',
                    },
                });
            }
        };

        socket.on('connect_error', handleConnectError);
        socket.on('vital:new', handleVitalNew);
        socket.on('vital:feedback', handleVitalFeedback);
        socket.on('notification:acknowledged', handleNotificationAcknowledged);

        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('vital:new', handleVitalNew);
            socket.off('vital:feedback', handleVitalFeedback);
            socket.off('notification:acknowledged', handleNotificationAcknowledged);
        };
    }, [socket, isConnected, session?.user?.id, session?.user?.accessToken, session?.user?.role]);

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
            await acknowledgeNotification(notificationId, session?.user?.accessToken as string);
            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
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