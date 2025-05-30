'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatPopup } from '../utils/ChatPopup';
import { useSession } from 'next-auth/react';
import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';
import { Types } from 'mongoose';
import { ConversationList } from '../Modules/Chat/ConversationList';
import OnlineUsers from '../Modules/Chat/OnlineUsers';

const ChatHolder = () => {
    const { data: session } = useSession();
    const { socket } = useSocket();
    const [showChat, setShowChat] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
    const userId = session?.user?.id as string | undefined;
    const { onlineUsers, offlineUsers, conversations, isLoading, error, fetchConversations } = useMessages(userId ?? '', socket);

    useEffect(() => {
        if (userId && Types.ObjectId.isValid(userId)) {
            fetchConversations();
        } else {
            console.warn('Invalid or missing userId:', userId);
        }
    }, [userId, fetchConversations]);

    const handleSelectUser = useCallback(
        (selectedUserId: string, selectedUserName: string) => {
            if (!Types.ObjectId.isValid(selectedUserId)) {
                console.error('Invalid selectedUserId:', selectedUserId);
                return;
            }
            setSelectedUser({ id: selectedUserId, name: selectedUserName });
            setShowChat(true);
        },
        []
    );

    if (!userId || !Types.ObjectId.isValid(userId)) {
        return <div className="text-center text-gray-500">Please log in to access the chat.</div>;
    }

    return (
        <div className="min-h-screen p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
                <OnlineUsers
                    onlineUsers={onlineUsers}
                    offlineUsers={offlineUsers}
                    currentUserId={userId}
                    onSelectUser={handleSelectUser}
                />
            </div>
            <div className="w-full md:w-2/3">
                {isLoading && (<svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                </svg>)}
                {error && <div className="text-center text-red-500">Error: {error}</div>}
                {!isLoading && conversations.length === 0 && (
                    <div className="text-center text-gray-500">No conversations yet</div>
                )}
                <ConversationList
                    conversations={conversations}
                    onSelectUser={(userId) => {
                        const user = conversations.find((c) => c.userId === userId);
                        if (user) {
                            handleSelectUser(userId, user.name);
                        }
                    }}

                />
                {selectedUser && (
                    <ChatPopup
                        userId={userId}
                        selectedUserId={selectedUser.id}
                        selectedUserName={selectedUser.name}
                        isOpen={showChat}
                        onClose={() => {
                            setShowChat(false);
                            setSelectedUser(null);
                        }}
                        className="z-50"
                    />
                )}
            </div>
        </div>
    );
};

export default ChatHolder;