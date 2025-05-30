'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Types } from 'mongoose';
import Image from 'next/image';
import { OnlineUser } from '@/components/utils/DoctorList';

interface OnlineUsersProps {
    onlineUsers: OnlineUser[];
    offlineUsers: OnlineUser[];
    currentUserId: string;
    onSelectUser: (userId: string, name: string) => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ onlineUsers, offlineUsers, currentUserId, onSelectUser }) => {
    const [tab, setTab] = useState<'online' | 'offline'>('online');
    const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter users based on search query and tab
    useEffect(() => {
        setIsLoading(true);
        const usersToFilter = tab === 'online'
            ? onlineUsers.filter((user) => user.id !== currentUserId)
            : offlineUsers.filter((user) => user.id !== currentUserId);
        const filtered = usersToFilter.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
        setIsLoading(false);
        console.log(`Filtered ${tab} users:`, filtered);
    }, [searchQuery, onlineUsers, offlineUsers, tab, currentUserId]);

    const handleTabChange = (newTab: 'online' | 'offline') => {
        setTab(newTab);
        setSearchQuery('');
        setError(null);
        console.log(`Switched to ${newTab} tab`);
    };

    const handleUserClick = (userId: string, userName: string) => {
        console.log('User clicked:', { userId, isValid: Types.ObjectId.isValid(userId) });
        if (Types.ObjectId.isValid(userId)) {
            onSelectUser(userId, userName);
        } else {
            console.error('Invalid user ID:', userId);
            setError('Invalid user ID');
        }
    };

    return (
        <div className="w-full h-[90vh] mx-auto bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {['online', 'offline'].map((tabName) => (
                    <button
                        key={tabName}
                        className={`flex-1 py-3 text-center text-sm font-medium capitalize transition-colors ${tab === tabName
                            ? 'text-blue-600'
                            : 'text-gray-600 hover:text-blue-500'
                            }`}
                        onClick={() => handleTabChange(tabName as 'online' | 'offline')}
                    >
                        {tabName === 'online' ? 'Online Users' : 'Offline Users'}
                        <motion.div
                            className="h-1 bg-blue-600 mt-2"
                            initial={false}
                            animate={{ width: tab === tabName ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                        />
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* User List */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500">
                        {searchQuery ? 'No users found' : `No ${tab} users available`}
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center p-3 mb-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => handleUserClick(user.id, user.name)}
                            >
                                <Image
                                    width={48}
                                    height={48}
                                    src={user.avatar || '/avatar_male.png'}
                                    alt={user.name}
                                    className="w-12 h-12 border rounded-full object-cover mr-4"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                        {tab === 'online' && (
                                            <span className="w-3 h-3 bg-green-500 rounded-full" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default OnlineUsers;