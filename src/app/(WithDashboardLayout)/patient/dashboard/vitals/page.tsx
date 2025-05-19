'use client';

import { useEffect, useState } from 'react';
import ClientVitals from '@/components/Modules/Dashboard/Patient/Vitals/ClientVitals';
import { GetAllDocsSocket } from '@/service/Doctor';
import { GetVitalsByUserId } from '@/service/VitalService';
import { IDoctor, Vital } from '@/types';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import LoadingPage from '@/app/loading';
import { Meta } from '@/components/Modules/Dashboard/Admin/Doctor/DocRequestTable';

export default function VitalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook to access query parameters
    const [vitalsHistory, setVitalsHistory] = useState<Vital[]>([]);
    const [allDoctors, setAllDoctors] = useState<IDoctor[]>([]);
    const [vitalsMeta, setVitalsMeta] = useState<Meta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session?.user?.role !== 'patient') {
            router.push('/403');
            return;
        }

        // Get the page number from URL query parameter
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

        const fetchVitals = async () => {
            try {
                const response = await GetVitalsByUserId({
                    userId: session?.user?.id as string,
                    token: session?.user?.accessToken as string,
                    page: pageFromUrl, // Pass the page number to the API
                });
                setVitalsHistory(response.vitals);
                setVitalsMeta({
                    ...response.vitamMeta, // Assuming API returns vitalsMeta
                    page: pageFromUrl, // Ensure the page is set to URL value
                });
            } catch (error) {
                console.error('❌ Failed to fetch vitals history:', error);
            }
        };

        const fetchDoctors = async () => {
            try {
                if (!session?.user?.accessToken) {
                    return;
                }
                const { doctors } = await GetAllDocsSocket({
                    page: 1,
                    limit: 20,
                    token: session?.user?.accessToken,
                });
                setAllDoctors(doctors);
            } catch (error) {
                console.error('❌ Failed to fetch doctors:', error);
            }
        };

        fetchVitals();
        fetchDoctors();
    }, [session, status, router, searchParams]); // Add searchParams to dependency array

    if (status === 'loading') return <LoadingPage />;

    return (
        session?.user?.role === 'patient' && (
            <ClientVitals
                initialVitalsHistory={vitalsHistory}
                allDoctors={allDoctors}
                userId={session.user.id}
                accessToken={session.user.accessToken}
                vitalsMeta={vitalsMeta}
            />
        )
    );
}