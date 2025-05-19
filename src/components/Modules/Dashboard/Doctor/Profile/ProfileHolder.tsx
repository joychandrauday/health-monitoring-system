/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { IDoctor } from '@/types';
import React, { useEffect, useState } from 'react';
import DoctorProfile from './DoctorProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralProfile } from './GeneralProfile';
import { getDoctorProfile } from '@/service/Profile';
import { useSession } from 'next-auth/react';

const ProfileHolder = () => {
    const [doctor, setDoctor] = useState<Partial<IDoctor>>({});
    const { data: session } = useSession();
    useEffect(() => {
        const fetchUser = async () => {
            const user = await getDoctorProfile(
                session?.user?.id as string,
                session?.user?.accessToken as string
            )
            setDoctor(user)
        }
        fetchUser()
    }, []);

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
                    <DoctorProfile doctorId={doctor._id as string} doctorFromDb={doctor as IDoctor} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfileHolder;