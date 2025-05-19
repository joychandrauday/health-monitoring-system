'use client';

import { IMedicalNotification } from '@/types';
import { FaBell } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationList from './NotificationList';
import { useState } from 'react';

interface NotificationBellProps {
    notifications: IMedicalNotification[];
    clearNotifications?: () => void;
    acknowledgeNotification: (notificationId: string) => void;
}

const NotificationBell = ({
    notifications,
    clearNotifications,
    acknowledgeNotification,
}: NotificationBellProps) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Filter out acknowledged notifications
    const unacknowledgedNotifications = notifications.filter((n) => !n.acknowledged);

    return (
        <div className="absolute top-0 right-0">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="relative p-2 rounded-full bg-white border-gray-300 hover:bg-gray-100"
                        aria-label={`Notifications (${unacknowledgedNotifications.length} unacknowledged)`}
                    >
                        <FaBell className="text-blue-600 text-lg" />
                        {unacknowledgedNotifications.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500 text-white">
                                {unacknowledgedNotifications.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-80 sm:w-96 bg-white shadow p-4 max-h-[400px] overflow-y-auto rounded-lg"
                    align="end"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        {unacknowledgedNotifications.length > 0 && clearNotifications && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearNotifications}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                    {unacknowledgedNotifications.length === 0 ? (
                        <p className="text-gray-500 text-sm">No notifications</p>
                    ) : (
                        <NotificationList
                            notifications={unacknowledgedNotifications}
                            acknowledgeNotification={acknowledgeNotification}
                        />
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default NotificationBell;