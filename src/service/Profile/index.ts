/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { Session, User } from '@/types';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

// Fetch user profile
export const getSingleUserProfile = async () => {
    try {
        const session = await getServerSession(authOptions);
        const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_API}/doctors/${session?.user?.id}`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`,
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch user. Status code: ${res.status}`);
        }
        const data = await res.json();
        return data.data;
    } catch (error: any) {
        console.error("Error fetching user:", error.message);
        throw new Error(error.message);
    }
};
export const getSingleProfile = async (session: Session) => {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_API}/users/${session?.user?.id}`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`,
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch user. Status code: ${res.status}`);
        }
        const data = await res.json();
        return data.data;
    } catch (error: any) {
        console.error("Error fetching user:", error.message);
        throw new Error(error.message);
    }
};


export const getGeneralProfile = async (
    userId: string,
    token: string
): Promise<User> => {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_API}/users/${userId}`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Ensure fresh data
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Failed to fetch user. Status code: ${res.status}`
            );
        }

        const data = await res.json();
        console.log('Fetch Data:', data);
        if (!data.data) {
            throw new Error('No user data returned from API');
        }

        return data;
    } catch (error: any) {
        console.error('Error fetching user:', error.message);
        throw new Error(error.message);
    }
};
export const getDoctorProfile = async (
    userId: string,
    token: string
): Promise<User> => {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_API}/doctors/${userId}`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Ensure fresh data
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Failed to fetch user. Status code: ${res.status}`
            );
        }

        const data = await res.json();
        console.log('Fetch Data:', data);
        if (!data.data) {
            throw new Error('No user data returned from API');
        }

        return data.data;
    } catch (error: any) {
        console.error('Error fetching user:', error.message);
        throw new Error(error.message);
    }
};

// Update user profile
export const UpdateDoctor = async (
    userId: string,
    userData: any,
    token: string
): Promise<any> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/doctors/${userId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }
        );

        const updatedUser = await res.json();
        revalidatePath(`/user/dashboard`);
        return updatedUser;
    } catch (error: any) {
        console.error("Error updating user:", error.message);
        return Error(error.message);
    }
};
export const UpdateGeneralProfile = async (
    userId: string,
    userData: any,
    token: string
): Promise<any> => {
    try {
        console.log(userData);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/users/${userId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            }
        );

        const updatedUser = await res.json();
        console.log(updatedUser);
        revalidatePath(`/user/dashboard`);
        return updatedUser;
    } catch (error: any) {
        console.error("Error updating user:", error.message);
        return Error(error.message);
    }
};

// Update user profile
export const deleteUser = async (
    userId: string
): Promise<any> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/users/${userId}`,
            {
                method: "DELETE",
            }
        );

        const deleted = await res.json();
        revalidatePath(`/user/dashboard`);
        return deleted;
    } catch (error: any) {
        console.error("Error updating user:", error.message);
        return Error(error.message);
    }
};

