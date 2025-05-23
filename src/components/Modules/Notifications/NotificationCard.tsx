'use client';

import Image from 'next/image';
import { FaHeartbeat, FaEnvelope, FaCalendar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { IMedicalNotification } from '@/types';

interface NotificationCardProps {
    notification: IMedicalNotification;
    acknowledgeNotification: (notificationId: string) => void;
}

const NotificationCard = ({ notification, acknowledgeNotification }: NotificationCardProps) => {
    const renderPatientInfo = (
        patientId: string | { _id: string; name: string; email: string; avatar?: string }
    ) => {
        if (typeof patientId === 'string') {
            return { name: `Patient ID: ${patientId}`, avatar: '/default-avatar.png' };
        }
        return { name: patientId.name, avatar: patientId.avatar || '/default-avatar.png' };
    };

    const renderNotificationIcon = (type: string) => {
        switch (type) {
            case 'vital':
                return <FaHeartbeat className="text-red-500" />;
            case 'chat':
                return <FaEnvelope className="text-blue-500" />;
            case 'appointment':
                return <FaCalendar className="text-green-500" />;
            default:
                return null;
        }
    };

    const { name, avatar } = renderPatientInfo(notification.sender);

    return (
        <li
            className={`relative p-4 rounded-xl my-2 shadow flex gap-4 bg-white border transition-all duration-300 hover:shadow-lg ${notification.acknowledged
                ? 'border-gray-200 opacity-80'
                : 'border-secondary'
                }`}
        >
            {/* Icon + Time Top Right */}
            <div className="absolute top-3 right-3 text-xs text-gray-500 flex items-center gap-2">
                {renderNotificationIcon(notification.type)}
                <span>
                    {new Date(notification.timestamp).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </span>
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
                <Image
                    width={48}
                    height={48}
                    src={avatar}
                    alt={`${name}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
                <div className="text-sm text-gray-500">
                    {typeof notification.sender === 'object' && 'role' in notification.sender
                        ? notification.sender.role
                        : 'Unknown'}
                </div>

                <div className="font-semibold text-gray-800">{name}</div>
                <div className="text-gray-700 text-sm">{notification.message}</div>

                {notification.url && (
                    <a
                        href={notification.url}
                        className="text-blue-600 text-sm underline hover:text-blue-800 block mt-1"
                    >
                        View Details
                    </a>
                )}

                {!notification.acknowledged && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                        onClick={() => acknowledgeNotification(notification._id)}
                    >
                        Acknowledge
                    </Button>
                )}
            </div>
        </li>
    );
};

export default NotificationCard;
