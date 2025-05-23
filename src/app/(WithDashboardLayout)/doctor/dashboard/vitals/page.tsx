import VitalUserPage from '@/components/Modules/Dashboard/Doctor/Vitals/VitalUserPage';
import { GetPatientsByDocId } from '@/service/VitalService';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

const Page = async () => {
    const session = await getServerSession(authOptions)
    const patients = await GetPatientsByDocId({ docId: session?.user?.id as string })
    return (
        <div>
            <VitalUserPage patients={patients.patients} />
        </div>
    );
}

export default Page;
