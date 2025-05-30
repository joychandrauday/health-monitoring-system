'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';

export interface OnlineUser {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

interface UserListProps {
    onSelectUser: (userId: string) => void;
    userId: string;
}

export const UserList: React.FC<UserListProps> = ({ onSelectUser, userId }) => {
    const { socket } = useSocket();
    const { onlineUsers, isOnline } = useMessages(userId, socket);
    const [filterRole, setFilterRole] = useState<string>('doctor'); // Default filter to show only doctors

    // Filter online users to show only doctors
    const filteredUsers = onlineUsers.filter((user: OnlineUser) => user.role.toLowerCase() === filterRole.toLowerCase());

    // Handle user selection with memoization
    const handleSelectUser = useCallback((userId: string) => {
        onSelectUser(userId);
    }, [onSelectUser]);

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Available Doctors</h2>
                <div className="flex items-center gap-4">
                    <label htmlFor="role-filter" className="text-sm font-medium text-gray-600">
                        Filter by Role:
                    </label>
                    <select
                        id="role-filter"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="doctor">Doctor</option>
                        <option value="all">All Roles</option>
                    </select>
                </div>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center text-gray-500 py-4">No doctors available at the moment.</div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredUsers.map((user: OnlineUser) => (
                    <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleSelectUser(user.id)}
                        className="relative flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Select ${user.name}, ${user.role}`}
                    >
                        {/* Avatar Container */}
                        <div
                            className={`relative rounded-full overflow-hidden border-2 w-20 h-20 ${isOnline(user.id) ? 'border-green-400' : 'border-gray-300'
                                } transition-all duration-300`}
                        >
                            <Image
                                width={80}
                                height={80}
                                src={user.avatar || '/avatar_male.png'}
                                alt={`${user.name}'s avatar`}
                                className="rounded-full border object-cover w-full h-full"
                            />
                            {/* Online Status Indicator */}
                            <span
                                className={`absolute z-50 bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isOnline(user.id) ? 'bg-green-400' : 'bg-gray-300'
                                    }`}
                            />
                        </div>

                        {/* User Info on Hover */}
                        <div className="absolute left-24 top-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 z-10 w-64">
                            <span className="font-semibold text-gray-800">{user.name}</span>
                            <span className="block text-sm text-gray-500">{user.role}</span>
                        </div>

                        {/* User Name Below Avatar */}
                        <span className="mt-2 text-sm font-medium text-gray-700 truncate w-20 text-center">
                            {user.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};