'use client';

import { IMedicalNotification } from '@/types';
import NotificationCard from './NotificationCard';

interface NotificationListProps {
    notifications: IMedicalNotification[];
    acknowledgeNotification: (notificationId: string) => void;
}

const NotificationList = ({ notifications, acknowledgeNotification }: NotificationListProps) => {
    return (
        <ul className="space-y-3">
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification._id}
                    notification={notification}
                    acknowledgeNotification={acknowledgeNotification}
                />
            ))}
        </ul>
    );
};

export default NotificationList;