
'use client'
import React from 'react';
import NotificationList from './NotificationList';
import { useNotifications } from '@/hooks/useNotification';
const NotficationHolder = () => {
    const { notifications, acknowledgeNotification } = useNotifications();

    return (
        <div className='container mx-auto'>
            <NotificationList notifications={notifications} acknowledgeNotification={acknowledgeNotification} />
        </div>
    );
}

export default NotficationHolder;
