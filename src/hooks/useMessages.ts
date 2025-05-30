/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { getMessage, sendMessages, getUniqueSenders } from '@/service/Chat';
import { ChatMessage, Sender } from '@/service/Chat';
import { Types } from 'mongoose';

interface ChatMeta {
    total: number;
    page: number;
    limit: number;
}

interface OnlineUser {
    id: string;
    role: string;
    name: string;
    avatar?: string;
}

interface Conversation {
    userId: string;
    name: string;
    avatar: string;
    lastMessage?: string;
    lastMessageTimestamp?: string;
    isOnline: boolean;
}

interface SenderResponse {
    userId?: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTimestamp?: string;
}

interface UseMessagesReturn {
    messages: ChatMessage[];
    sendMessage: (receiverId: string, content: string) => Promise<void>;
    fetchChatHistory: (receiverId: string, page?: number, limit?: number) => Promise<void>;
    fetchConversations: () => Promise<void>;
    meta: ChatMeta | null;
    onlineUsers: OnlineUser[];
    offlineUsers: OnlineUser[];
    conversations: Conversation[];
    isOnline: (checkUserId: string) => boolean;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

export const useMessages = (userId: string, socket: Socket | null | undefined): UseMessagesReturn => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [meta, setMeta] = useState<ChatMeta | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<OnlineUser[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messageIds = useRef<Set<string>>(new Set());
    const hasFetchedConversations = useRef(false);

    // Centralized validation function for session and token
    const isSessionValid = useCallback((): boolean => {
        const isValid = session?.user && typeof session.user.accessToken === 'string' && session.user.accessToken.length > 0;
        if (!isValid) {
            console.warn('Session validation failed:', {
                hasUser: !!session?.user,
                hasToken: !!session?.user?.accessToken,
                tokenLength: session?.user?.accessToken?.length || 0,
            });
            setError('Invalid session or access token');
        }
        return isValid as boolean;
    }, [session]);

    useEffect(() => {
        if (!socket || !isSessionValid() || !Types.ObjectId.isValid(userId)) {
            console.warn('Initial setup failed:', {
                socket: !!socket,
                sessionValid: isSessionValid(),
                userIdValid: Types.ObjectId.isValid(userId),
            });
            return;
        }

        // console.log('Setting up WebSocket listeners for user:', userId);
        socket.on('connect', () => console.log('WebSocket connected'));
        socket.on('disconnect', () => console.log('WebSocket disconnected'));

        const role = session?.user?.role;
        if (role === 'doctor') {
            socket.emit('joinDoctorRoom', { doctorId: userId });
        } else if (role === 'patient') {
            socket.emit('joinPatientRoom', { patientId: userId });
        } else if (role === 'admin') {
            socket.emit('joinAdminRoom', { adminId: userId });
        }

        socket.on('message', (message: ChatMessage) => {
            if (!message._id || messageIds.current.has(message._id)) {
                console.warn('Message ignored:', {
                    hasId: !!message._id,
                    isDuplicate: messageIds.current.has(message._id || ''),
                });
                return;
            }

            const senderId = typeof message.senderId === 'object' && message.senderId?._id
                ? message.senderId._id
                : typeof message.senderId === 'string'
                    ? message.senderId
                    : undefined;
            const receiverId = typeof message.receiverId === 'string' ? message.receiverId : undefined;

            if (!senderId || !receiverId || !Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(receiverId)) {
                console.error('Invalid senderId or receiverId:', { senderId, receiverId });
                return;
            }

            setMessages((prev) => {
                const updatedMessages = [
                    ...prev,
                    { ...message, timestamp: message.timestamp || new Date().toISOString() },
                ];
                return updatedMessages.sort(
                    (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
                );
            });
            messageIds.current.add(message._id);

            setConversations((prev) => {
                const targetUserId = senderId === userId ? receiverId : senderId;
                const existingConv = prev.find((conv) => conv.userId === targetUserId);
                let updatedConversations: Conversation[];

                if (existingConv) {
                    updatedConversations = prev.map((conv) =>
                        conv.userId === targetUserId
                            ? {
                                ...conv,
                                lastMessage: message.message,
                                lastMessageTimestamp: message.timestamp || new Date().toISOString(),
                            }
                            : conv
                    );
                } else {
                    updatedConversations = [
                        {
                            userId: targetUserId,
                            name: (typeof message.senderId === 'object' && message.senderId?.name) || 'Unknown',
                            avatar: (typeof message.senderId === 'object' && message.senderId?.avatar) || '/avatar_male.png',
                            lastMessage: message.message,
                            lastMessageTimestamp: message.timestamp || new Date().toISOString(),
                            isOnline: onlineUsers.some((u) => u.id === targetUserId),
                        },
                        ...prev,
                    ];
                }
                const sortedConversations = updatedConversations.sort((a, b) => {
                    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : -1;
                    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : -1;
                    return timeB - timeA;
                });
                return sortedConversations;
            });
        });

        socket.on('userStatus', ({ onlineUsers, offlineUsers }: { onlineUsers: OnlineUser[]; offlineUsers: OnlineUser[] }) => {
            setOnlineUsers(onlineUsers);
            setOfflineUsers(offlineUsers);
            setConversations((prev) => {
                const updatedConversations = prev.map((conv) => ({
                    ...conv,
                    isOnline: onlineUsers.some((u) => u.id === conv.userId),
                }));
                return updatedConversations.sort((a, b) => {
                    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : -1;
                    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : -1;
                    return timeB - timeA;
                });
            });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('message');
            socket.off('userStatus');
        };
    }, [socket, userId, isSessionValid]);

    const isOnline = useCallback(
        (checkUserId: string): boolean => {
            return onlineUsers.some((user) => user.id === checkUserId);
        },
        [onlineUsers]
    );

    const sendMessage = useCallback(
        async (receiverId: string, content: string) => {
            if (!isSessionValid()) {
                console.error('Cannot send message: Invalid session or access token');
                setError('Cannot send message: Invalid session or access token');
                return;
            }
            if (!socket) {
                console.error('Socket not connected');
                setError('Socket not connected');
                return;
            }
            if (!Types.ObjectId.isValid(receiverId)) {
                console.error('Invalid receiverId:', receiverId);
                setError(`Invalid receiverId: ${receiverId}`);
                return;
            }

            setIsLoading(true);
            setError(null);

            const message: ChatMessage = {
                receiverId,
                message: content,
            };

            try {
                const response = await sendMessages(message, session!.user!.accessToken);

                if (response._id && !messageIds.current.has(response._id)) {
                    const newMessage: ChatMessage = {
                        ...message,
                        _id: response._id,
                        senderId: { _id: userId, name: session!.user!.name || 'Unknown' } as Sender,
                        timestamp: response.createdAt || response.timestamp || new Date().toISOString(),
                    };
                    setMessages((prev) => {
                        const updatedMessages = [...prev, newMessage];
                        return updatedMessages.sort(
                            (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
                        );
                    });
                    messageIds.current.add(response._id);
                    socket.emit('message', { receiverId, message: newMessage });
                    setConversations((prev) => {
                        const existingConv = prev.find((conv) => conv.userId === receiverId);
                        let updatedConversations: Conversation[];
                        if (existingConv) {
                            updatedConversations = prev.map((conv) =>
                                conv.userId === receiverId
                                    ? {
                                        ...conv,
                                        lastMessage: content,
                                        lastMessageTimestamp: newMessage.timestamp,
                                    }
                                    : conv
                            );
                        } else {
                            updatedConversations = [
                                {
                                    userId: receiverId,
                                    name: 'Unknown',
                                    avatar: '/avatar_male.png',
                                    lastMessage: content,
                                    lastMessageTimestamp: newMessage.timestamp,
                                    isOnline: onlineUsers.some((u) => u.id === receiverId),
                                },
                                ...prev,
                            ];
                        }
                        return updatedConversations.sort((a, b) => {
                            const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : -1;
                            const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : -1;
                            return timeB - timeA;
                        });
                    });
                } else {
                    console.warn('Message not added:', {
                        hasId: !!response._id,
                        isDuplicate: messageIds.current.has(response._id || ''),
                    });
                }
            } catch (err) {
                console.error('Error sending message:', err);
                setError(err instanceof Error ? err.message : 'Failed to send message');
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [socket, userId, isSessionValid, session?.user?.name]
    );

    const fetchChatHistory = useCallback(
        async (receiverId: string, page = 1, limit = 10) => {
            if (!isSessionValid()) {
                console.error('Cannot fetch chat history: Invalid session or access token');
                setError('Cannot fetch chat history: Invalid session or access token');
                return;
            }
            if (!Types.ObjectId.isValid(receiverId)) {
                console.error('Invalid receiverId for fetchChatHistory:', receiverId);
                setError(`Invalid receiverId: ${receiverId}`);
                return;
            }
            if (!Types.ObjectId.isValid(userId)) {
                console.error('Invalid userId for fetchChatHistory:', userId);
                setError(`Invalid userId: ${userId}`);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const { chats, meta } = await getMessage(
                    userId,
                    receiverId,
                    session!.user!.accessToken,
                    page,
                    limit
                );
                const newMessages = chats.filter((msg: ChatMessage) => msg._id && !messageIds.current.has(msg._id));
                newMessages.forEach((msg: ChatMessage) => {
                    if (msg._id) {
                        messageIds.current.add(msg._id);
                    }
                });
                setMessages((prev) => {
                    const updatedMessages = [...newMessages, ...prev];
                    return updatedMessages.sort(
                        (a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
                    );
                });
                setMeta(meta);
            } catch (err) {
                console.error('Error fetching chat history:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch chat history');
                setMessages([]);
                setMeta(null);
            } finally {
                setIsLoading(false);
            }
        },
        [userId, isSessionValid]
    );

    const fetchConversations = useCallback(async () => {
        if (!isSessionValid()) {
            console.error('Cannot fetch conversations: Invalid session or access token');
            setError('Cannot fetch conversations: Invalid session or access token');
            return;
        }
        if (!Types.ObjectId.isValid(userId)) {
            console.error('Invalid userId for fetchConversations:', userId);
            setError(`Invalid userId: ${userId}`);
            return;
        }
        if (hasFetchedConversations.current) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const { senders } = await getUniqueSenders(userId, session!.user!.accessToken, 1, 10);
            const invalidSenders = senders.filter((sender: SenderResponse) => !sender.userId || !Types.ObjectId.isValid(sender.userId));
            if (invalidSenders.length > 0) {
                console.warn('Invalid sender userIds detected:', invalidSenders);
            }
            const newConversations: Conversation[] = senders
                .filter((sender: SenderResponse) => sender.userId && Types.ObjectId.isValid(sender.userId))
                .map((sender: SenderResponse) => ({
                    userId: sender.userId!,
                    name: sender.name,
                    avatar: sender.avatar || '/avatar_male.png',
                    lastMessage: sender.lastMessage,
                    lastMessageTimestamp: sender.lastMessageTimestamp,
                    isOnline: onlineUsers.some((u) => u.id === sender.userId),
                }))
                .sort((a, b) => {
                    const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : -1;
                    const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : -1;
                    return timeB - timeA;
                });
            setConversations(newConversations);
            hasFetchedConversations.current = true;
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
            setConversations([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId, isSessionValid, onlineUsers]);

    const logout = useCallback(() => {
        if (socket) {
            // console.log('Logging out and disconnecting socket');
            socket.emit('logout');
            socket.disconnect();
        }
        setMessages([]);
        setMeta(null);
        setOnlineUsers([]);
        setOfflineUsers([]);
        setConversations([]);
        setIsLoading(false);
        setError(null);
        messageIds.current.clear();
        hasFetchedConversations.current = false;
    }, [socket]);

    return {
        messages,
        sendMessage,
        fetchChatHistory,
        fetchConversations,
        meta,
        onlineUsers,
        offlineUsers,
        conversations,
        isOnline,
        logout,
        isLoading,
        error,
    };
};