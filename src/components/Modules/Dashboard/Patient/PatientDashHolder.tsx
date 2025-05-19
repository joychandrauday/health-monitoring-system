'use client'
import { useNotifications } from '@/hooks/useNotification';
import { User } from '@/types';
import React from 'react';
import NotificationBell from '../../Notifications/NotificationBell';

const PatientDashHolder = ({ user }: { user: User }) => {
    const { notifications, clearNotifications, acknowledgeNotification } = useNotifications();
    return (
        <div>
            <div className="wrap flex justify-between">
                <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
                <NotificationBell notifications={notifications} acknowledgeNotification={acknowledgeNotification} clearNotifications={clearNotifications} />
            </div>
            {user.doctorRequest && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                    <p>Your request to become a doctor is <strong>pending</strong>. Please wait for admin approval.</p>
                </div>
            )}

            <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {user.bloodGroup || 'N/A'}</p>
                <p><strong>Age:</strong> {user.age || 'N/A'}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {user.address?.street || 'N/A'}, {user.address?.city || ''}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    );
}

export default PatientDashHolder;
