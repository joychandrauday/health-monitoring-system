import VitalUserPage from '@/components/Modules/Dashboard/Doctor/Vitals/VitalUserPage';
import { getDoctorProfile } from '@/service/Profile';
import { GetPatientsByDocId } from '@/service/VitalService';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

const Page = async () => {
    const session = await getServerSession(authOptions)
    const data = await getDoctorProfile(session?.user?.id as string, session?.user?.accessToken as string)
    const patients = await GetPatientsByDocId({ docId: data._id })
    return (
        <div>
            <VitalUserPage patients={patients.patients} />
        </div>
    );
}

export default Page;
