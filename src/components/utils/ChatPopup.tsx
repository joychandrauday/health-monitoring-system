'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface ChatPopupProps {
    userId: string;
    selectedUserId: string | null;
    selectedUserName?: string;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export const ChatPopup: React.FC<ChatPopupProps> = ({
    userId,
    selectedUserId,
    selectedUserName = 'User',
    isOpen,
    onClose,
    className = '',
}) => {
    const { socket, isConnected } = useSocket();
    const { messages, sendMessage, fetchChatHistory, isOnline, meta, isLoading, error } = useMessages(userId, socket);
    const [input, setInput] = useState('');
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFetchingMore = useRef<boolean>(false);
    const [isOnlineUser, setIsOnlineUser] = useState(false);

    // Update online status
    useEffect(() => {
        if (selectedUserId && isOpen && isConnected) {
            const online = isOnline(selectedUserId);
            setIsOnlineUser(online);
        } else {
            setIsOnlineUser(false);
        }
    }, [isOpen, selectedUserId, isConnected, isOnline]);

    // Scroll to bottom handler
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // Fetch chat history
    useEffect(() => {
        if (!isOpen || !selectedUserId || !isConnected) return;

        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(() => {
            fetchChatHistory(selectedUserId, page, 10).catch((err) =>
                console.error('Failed to fetch chat history:', err)
            );
        }, 300);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [isOpen, selectedUserId, isConnected, page, fetchChatHistory]);

    // Auto-scroll on messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load more messages
    const loadMoreMessages = useCallback(() => {
        if (isFetchingMore.current || isLoading || !meta || messages.length >= meta.total) return;
        isFetchingMore.current = true;
        setPage((prev) => prev + 1);
        setTimeout(() => {
            isFetchingMore.current = false;
        }, 300);
    }, [isLoading, meta, messages.length]);

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (scrollAreaRef.current && scrollAreaRef.current.scrollTop === 0) {
            loadMoreMessages();
        }
    }, [loadMoreMessages]);

    // Add scroll event listener
    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
            scrollArea.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (scrollArea) {
                scrollArea.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    // Handle message send
    const handleSend = useCallback(async () => {
        if (!input.trim() || !selectedUserId || !isConnected) {
            console.warn('Cannot send message:', { hasInput: !!input.trim(), selectedUserId, isConnected });
            return;
        }

        try {
            await sendMessage(selectedUserId, input);
            setInput('');
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    }, [input, selectedUserId, isConnected, sendMessage, scrollToBottom]);

    // Handle Enter key press
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    if (!isOpen || !selectedUserId) return null;

    return (
        <div
            className={`fixed bottom-16 right-6 w-80 md:w-96 h-[28rem] bg-white shadow-lg rounded-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
            role="dialog"
            aria-label={`Chat with ${selectedUserName}`}
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

            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-secondary text-white rounded-t-2xl border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-white truncate">{selectedUserName}</span>
                    <span className={`text-[12px] font-normal border rounded-full px-3 ${isOnlineUser ? 'text-white animate-pulse' : 'text-gray-500'}`}>
                        {isOnlineUser ? 'Online' : 'Offline'}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close chat"
                    className="text-white hover:text-gray-700 hover:bg-gray-200 rounded-full"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-white" ref={scrollAreaRef}>
                <div className="p-4 space-y-3">
                    {meta && messages.length < meta.total && (
                        <Button
                            onClick={loadMoreMessages}
                            disabled={isLoading || isFetchingMore.current}
                            className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium rounded-md transition-colors"
                        >
                            {isLoading ? 'Loading...' : 'Load Older Messages'}
                        </Button>
                    )}
                    {error && (
                        <p className="text-red-500 text-center text-xs">Error happened!</p>
                    )}
                    {isLoading && !messages.length ? (
                        <div className="flex justify-center items-center h-full">
                            <svg
                                className="animate-spin h-5 w-5 text-teal-500"
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
                                />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        </div>
                    ) : messages.length === 0 ? (
                        <p className="text-gray-500 text-center text-sm mt-10">Start a conversation...</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.senderId?._id === userId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-lg text-sm max-w-[75%] transition-all ${msg.senderId?._id === userId
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}
                                >
                                    <p className="break-words">{msg.message}</p>
                                    {msg.imageUrls?.length ? (
                                        <div className="mt-2 flex gap-2 flex-wrap">
                                            {msg.imageUrls.map((url, index) => (
                                                <Image
                                                    key={index}
                                                    src={url}
                                                    alt={`Attachment ${index + 1}`}
                                                    width={60}
                                                    height={60}
                                                    className="object-cover rounded-md"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-image.png';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                    <div
                                        className={`text-xs mt-1 ${msg.senderId?._id === userId ? 'text-teal-100' : 'text-gray-500'}`}
                                    >
                                        {msg.timestamp
                                            ? new Date(msg.timestamp).toLocaleString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                                hour12: true,
                                                timeZone: 'Asia/Dhaka',
                                            })
                                            : 'Unknown time'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* Input */}
            <div className="p-2 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        aria-label="Message input"
                        disabled={!isConnected || isLoading}
                        className="rounded-lg border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-sm placeholder-gray-400 flex-1 disabled:opacity-50"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || !isConnected || isLoading}
                        size="icon"
                        aria-label="Send message"
                        className=" text-xl rounded-lg text-white disabled:opacity-50"
                    >
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    );
};