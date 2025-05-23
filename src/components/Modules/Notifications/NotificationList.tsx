'use client';

import { IMedicalNotification } from '@/types';
import NotificationCard from './NotificationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react'; // Assuming lucide-react for icons

interface NotificationListProps {
    notifications: IMedicalNotification[];
    acknowledgeNotification: (notificationId: string) => void;
}

const NotificationList = ({ notifications, acknowledgeNotification }: NotificationListProps) => {
    return (
        <Card className=" max-w-3xl mx-auto shadow-md border-none bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-800">
                    All Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No Notifications Available</p>
                        <p className="text-sm mt-2">You&apos;re all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notification) => (
                            <li
                                key={notification._id}
                                className="transition-transform duration-200 hover:-translate-y-1"
                            >
                                <NotificationCard
                                    notification={notification}
                                    acknowledgeNotification={acknowledgeNotification}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default NotificationList;