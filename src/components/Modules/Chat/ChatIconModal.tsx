'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ConversationList } from './ConversationList'; // Adjust path as needed
import useSocket from '@/hooks/useSocket'; // Adjust path as needed
import { useMessages } from '@/hooks/useMessages';
import { Types } from 'mongoose';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { ChatPopup } from '@/components/utils/ChatPopup';
import { MessageSquare, X } from 'lucide-react';

const ChatIconModal: React.FC = () => {
    const { data: session } = useSession();
    const { socket } = useSocket();
    const userId = session?.user?.id as string | undefined;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
    const { conversations, isLoading, error, fetchConversations } = useMessages(userId ?? '', socket);

    // Fetch conversations when user is logged in
    useEffect(() => {
        if (userId && Types.ObjectId.isValid(userId)) {
            console.log('Fetching conversations for ChatIconModal, userId:', userId);
            fetchConversations();
        } else {
            console.warn('Invalid or missing userId for ChatIconModal:', userId);
        }
    }, [userId, fetchConversations]);

    // Show toast for new messages
    useEffect(() => {
        if (!socket || !session?.user || !userId) {
            console.warn('Socket or user not ready for notifications:', { socket: !!socket, userId });
            return;
        }

        socket.on('message', (message: any) => {
            console.log('ChatIconModal received message:', message);
            if (message.receiverId === userId && message.senderId?._id !== userId) {
                toast.success(
                    <div>
                        <strong>{message.senderId.name}</strong>: {message.message}
                    </div>,
                    {
                        duration: 5000,
                        icon: (
                            <Image
                                src={message.senderId.avatar || '/avatar_male.png'}
                                alt={message.senderId.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        ),
                    }
                );
                console.log('Toast notification shown for message:', message);
            }
        });

        return () => {
            socket.off('message');
        };
    }, [socket, userId, session?.user]);

    const handleSelectUser = useCallback(
        (selectedUserId: string) => {
            console.log('ChatIconModal handleSelectUser:', { selectedUserId });
            if (!Types.ObjectId.isValid(selectedUserId)) {
                console.error('Invalid selectedUserId in ChatIconModal:', selectedUserId);
                return;
            }
            const user = conversations.find((c) => c.userId === selectedUserId);
            if (user) {
                setSelectedUser({ id: selectedUserId, name: user.name });
                setIsModalOpen(false);
                console.log('Set selectedUser:', { id: selectedUserId, name: user.name });
            }
        },
        [conversations]
    );

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
        console.log('Chat modal toggled:', !isModalOpen);
    };

    if (!session?.user || !userId || !Types.ObjectId.isValid(userId)) {
        return null;
    }

    console.log('ChatIconModal rendering, conversations:', conversations);

    return (
        <>
            {/* Chat Icon */}
            <button
                onClick={toggleModal}
                className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                aria-label="Open chat"
            >
                <MessageSquare />
            </button>

            {/* Messenger-style Modal */}
            {isModalOpen && (
                <div
                    className="fixed min-h-[60vh] bottom-16 right-6 w-80 bg-white rounded-lg shadow z-50 transform transition-transform duration-300 ease-in-out translate-x-0"
                    style={{ animation: isModalOpen ? 'slideIn 0.3s ease-in-out' : 'slideOut 0.3s ease-in-out' }}
                >
                    <style jsx>{`
                        @keyframes slideIn {
                            from {
                                transform: translateX(100%);
                            }
                            to {
                                transform: translateX(0);
                            }
                        }
                        @keyframes slideOut {
                            from {
                                transform: translateX(0);
                            }
                            to {
                                transform: translateX(100%);
                            }
                        }
                    `}</style>
                    <button
                        onClick={toggleModal}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none absolute top-0 right-0"
                        aria-label="Close chat modal"
                    >
                        <X />
                    </button>

                    {error && <div className="text-center text-red-500 text-sm">Error: {error}</div>}
                    <ConversationList
                        key={conversations.map(c => c.userId + c.lastMessageTimestamp).join(',')}
                        conversations={conversations}
                        onSelectUser={handleSelectUser}
                        isLoading={isLoading}
                    />
                </div >
            )}

            {/* ChatPopup for selected user */}
            {
                selectedUser && (
                    <ChatPopup
                        userId={userId}
                        selectedUserId={selectedUser.id}
                        selectedUserName={selectedUser.name}
                        isOpen={!!selectedUser}
                        onClose={() => {
                            setSelectedUser(null);
                            console.log('Closed ChatPopup, reset selectedUser');
                        }}
                        className="z-50"
                    />
                )
            }
        </>
    );
};

export default ChatIconModal;