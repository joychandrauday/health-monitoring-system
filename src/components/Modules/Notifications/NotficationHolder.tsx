/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from 'react';
import { getNotifications } from '@/service/notification/Notification';
import { useEffect, useState } from 'react';
import { IMedicalNotification } from '@/types';
import { useSession } from 'next-auth/react';
import NotificationList from './NotificationList';
import { useNotifications } from '@/hooks/useNotification';
const NotficationHolder = () => {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<IMedicalNotification[]>([]);
    const { acknowledgeNotification } = useNotifications();
    useEffect(() => {
        const fetchNotif = async () => {
            const notifications = await getNotifications({
                userId: session?.user?.id as string,
                token: session?.user?.accessToken as string
            })
            console.log(session?.user?.id);
            setNotifications(notifications)
        }
        fetchNotif()
    }, [])
    return (
        <div>
            <NotificationList notifications={notifications} acknowledgeNotification={acknowledgeNotification} />
        </div>
    );
}

export default NotficationHolder;
