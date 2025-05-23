/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMedicalNotification } from '@/types';

export const saveNotification = async (
    notification: Omit<IMedicalNotification, '_id' | 'acknowledged'>,
    token: string
): Promise<IMedicalNotification> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/notifications`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...notification,
                timestamp: notification.timestamp.toISOString(),
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save notification');
        }

        const data = await response.json();
        return {
            ...data.data,
            timestamp: new Date(data.data.timestamp),
            patientId: data.data.patientId?._id || data.data.patientId,
            receiver: data.data.receiver,
        };
    } catch (error: any) {
        console.error('Error in saveNotification:', error);
        throw new Error(error.message || 'Failed to save notification');
    }
};

export const getNotifications = async ({ token, userId }: { token: string; userId: string }): Promise<IMedicalNotification[]> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/notifications/user/${userId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch notifications');
        }

        const data = await response.json();
        return data.data.notifications.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp),
            patientId: notif.patientId?._id || notif.patientId,
            receiver: notif.receiver,
        }));
    } catch (error: any) {
        console.error('Error in getNotifications:', error);
        throw new Error(error.message || 'Failed to fetch notifications');
    }
};

export const acknowledgeNotification = async (
    notificationId: string,
    token: string
): Promise<IMedicalNotification> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/notifications/${notificationId}/acknowledge`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to acknowledge notification');
        }

        const data = await response.json();
        return {
            ...data.data,
            timestamp: new Date(data.data.timestamp),
            patientId: data.data.patientId?._id || data.data.patientId,
            receiver: data.data.receiver,
        };
    } catch (error: any) {
        console.error('Error in acknowledgeNotification:', error);
        throw new Error(error.message || 'Failed to acknowledge notification');
    }
};

export const clearNotifications = async (token: string): Promise<void> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/notifications`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to clear notifications');
        }
    } catch (error: any) {
        console.error('Error in clearNotifications:', error);
        throw new Error(error.message || 'Failed to clear notifications');
    }
};