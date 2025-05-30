'use server';

// Define interfaces
// src/service/Chat/index.ts
export interface Sender {
    _id: string;
    name: string;
    email?: string;
    userId?: string;
    role?: string;
    avatar?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        _id?: string;
    };
    age?: number;
    bio?: string;
    bloodGroup?: string;
    gender?: string;
    phone?: string;
}

export interface ChatMessage {
    _id?: string;
    senderId?: Sender;
    receiverId: string;
    message: string;
    timestamp?: string;
    imageUrls?: string[];
}

interface ChatMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface SenderResponse {
    senders: Sender[];
    meta: ChatMeta;
}

// Send a message to the server
export const sendMessages = async (message: ChatMessage, token: string) => {
    try {
        console.log('Sending message to server:', { receiverId: message.receiverId, message: message.message });
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/chats`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ receiverId: message.receiverId, message: message.message }),
            cache: 'no-store',
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to send message:', res.status, errorText);
            throw new Error(`Failed to send message: ${res.statusText}`);
        }
        const response = await res.json();
        console.log('Server response for sendMessages:', response);

        // Handle nested response (e.g., { success: true, data: {...} })
        const messageData = response.data || response;
        if (!messageData._id) {
            console.error('Response missing _id:', response);
            throw new Error('Server response missing _id');
        }
        return messageData;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Fetch chat history for a user
export const getMessage = async (
    receiverId: string,
    senderId: string,
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<{ chats: ChatMessage[]; meta: ChatMeta }> => {
    try {
        const url = `${process.env.NEXT_PUBLIC_SERVER_API}/chats/${senderId}/${receiverId}?page=${page}&limit=${limit}`;
        console.log('Fetching messages from:', url);
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to fetch messages:', res.status, errorText);
            throw new Error(`Failed to fetch messages: ${res.statusText}`);
        }
        const data: { chats: ChatMessage[]; meta: ChatMeta } = await res.json();
        console.log('Fetched messages:', data);
        return data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return { chats: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
};

// Fetch unique senders for a receiver
export const getUniqueSenders = async (
    receiverId: string,
    token: string,
    page: number = 1,
    limit: number = 10
): Promise<SenderResponse> => {
    try {
        console.log('unique is called');
        const url = `${process.env.NEXT_PUBLIC_SERVER_API}/chats/${receiverId}?page=${page}&limit=${limit}`;
        console.log('Fetching unique senders from:', url);
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to fetch unique senders:', res.status, errorText);
            throw new Error(`Failed to fetch unique senders: ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Fetched unique senders:', data);
        const response: SenderResponse = {
            senders: data.data.senders,
            meta: data.data.meta,
        };
        return response;
    } catch (error) {
        console.error('Error fetching unique senders:', error);
        return { senders: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
};