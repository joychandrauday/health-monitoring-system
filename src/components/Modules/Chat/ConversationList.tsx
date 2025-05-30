import React from 'react';
import Image from 'next/image';

interface Conversation {
    userId: string;
    name: string;
    avatar: string;
    lastMessage?: string;
    lastMessageTimestamp?: string;
    isOnline: boolean;
}

interface ConversationListProps {
    conversations: Conversation[];
    onSelectUser: (userId: string) => void;
    isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    onSelectUser,
    isLoading
}) => {
    console.log('ConversationList conversations:', conversations);

    return (
        <div className="w-full min-h-[60vh] mx-auto bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold p-4 border-b">Conversations</h2>
            {
                isLoading && (<div className="bg-secondary">
                    <svg
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
                    </svg></div>) &&
                    conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No conversations yet</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {conversations.map((conv) => (
                            <li
                                key={conv.userId}
                                className="flex gap-3 items-center p-4 hover:bg-gray-100 cursor-pointer"
                                onClick={() => onSelectUser(conv.userId)}
                            >
                                <div className="wrap border rounded-full w-12 h-12 relative">
                                    {conv.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full mt-1"></span>
                                    )}
                                    <Image
                                        height={48}
                                        width={48}
                                        src={conv.avatar || '/avatar_male.png'} // Fallback avatar
                                        alt={conv.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-base font-medium text-gray-900">
                                            {conv.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {conv.lastMessageTimestamp
                                                ? new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {conv.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    );
};