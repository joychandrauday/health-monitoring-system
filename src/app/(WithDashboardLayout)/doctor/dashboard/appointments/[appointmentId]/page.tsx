import SingleAppointmentPatientDoc from '@/components/Modules/Dashboard/Doctor/Appointments/SingleAppointmentPatientDoc';
import { GetSingleAppointment } from '@/service/Appointments';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

interface Props {
    params: Promise<{
        appointmentId: string;
    }>;
}

const DynamicAppointmentPage = async ({ params }: Props) => {
    const session = await getServerSession(authOptions)
    const { appointmentId } = await params;
    try {
        const appointment = await GetSingleAppointment({ appointmentId: appointmentId, token: session?.user?.accessToken as string });
        if (!appointment || !appointment.appointment) {
            return <div className="p-4">appointment data not found</div>;
        }
        return (
            <div className="p-4">
                <SingleAppointmentPatientDoc appointment={appointment.appointment} token={session?.user?.accessToken as string} />
            </div>
        );
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return <div className="p-4">Error loading appointment data</div>;
    }
};

export default DynamicAppointmentPage;