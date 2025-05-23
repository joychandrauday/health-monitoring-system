
import AnalyticsHolder from '@/components/Modules/Dashboard/Doctor/Analytics/AnalyticsHolder';
import { GetPatientsByDocId } from '@/service/VitalService';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

const Page = async () => {
    const session = await getServerSession(authOptions)
    const patients = await GetPatientsByDocId({ docId: session?.user?.id as string })
    return (
        <div>
            <AnalyticsHolder patients={patients.patients} />
        </div>
    );
}

export default Page;
