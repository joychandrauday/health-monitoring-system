import SingleVitals from '@/components/Modules/Dashboard/Doctor/Vitals/SingleVitals';
import { GetSingleVital } from '@/service/VitalService';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

interface Props {
    params: Promise<{
        vitalId: string;
        patientId: string;
    }>;
}

const DynamicVitalPage = async ({ params }: Props) => {
    const session = await getServerSession(authOptions)
    const { vitalId } = await params;
    try {
        const vital = await GetSingleVital({
            vitalId: vitalId,
            token: session?.user?.accessToken as string
        });
        if (!vital || !vital.vital) {
            return <div className="p-4">Vital data not found</div>;
        }
        return (
            <div className="p-4">
                <SingleVitals vital={vital.vital} />
            </div>
        );
    } catch (error) {
        console.error('Error fetching vital:', error);
        return <div className="p-4">Error loading vital data</div>;
    }
};

export default DynamicVitalPage;