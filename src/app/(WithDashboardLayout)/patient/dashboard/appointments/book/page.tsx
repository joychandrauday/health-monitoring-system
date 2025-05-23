import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import BookAppointment from '@/components/Modules/Dashboard/Patient/Appointments/PostAppointment';

const Page = async () => {
    const session = await getServerSession(authOptions)
    return (
        <div>
            <BookAppointment token={session?.user?.accessToken as string} />
        </div>
    );
}

export default Page;
