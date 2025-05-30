/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { IDoctor } from '@/types';
import DoctorProfile from './DoctorProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralProfile } from './GeneralProfile';
import { getDoctorProfile } from '@/service/Profile';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

const ProfileHolder = () => {
    const [doctor, setDoctor] = useState<Partial<IDoctor> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) {
                setError('No valid session or access token');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const user = await getDoctorProfile(session.user.id, session.user.accessToken);
                setDoctor(user);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to fetch doctor profile';
                console.error('Fetch Doctor Error:', errorMessage);
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUser();
        } else if (status === 'unauthenticated') {
            setError('Please log in to view your profile');
            setIsLoading(false);
        }
    }, [status, session?.user?.id, session?.user?.accessToken]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 min-h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <Image
                        src="/capsule.gif"
                        alt="Loading"
                        width={48}
                        height={48}
                        priority
                        className="mx-auto"
                    />
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !doctor?._id) {
        return (
            <div className="container mx-auto p-6 min-h-[50vh] flex items-center justify-center">
                <div className="text-center text-gray-600">
                    <p>{error || 'No doctor profile available.'}</p>
                    {status === 'unauthenticated' && (
                        <a
                            href="/login"
                            className="mt-4 inline-block px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Log In
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Tabs defaultValue="general" className="w-full mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General Profile</TabsTrigger>
                    <TabsTrigger value="doctor">Doctor Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <GeneralProfile />
                </TabsContent>
                <TabsContent value="doctor">
                    <DoctorProfile doctorId={doctor._id} doctorFromDb={doctor as IDoctor} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfileHolder;