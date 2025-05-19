// app/patients/[patientId]/page.tsx
import DocUserVitalHolder from '@/components/Modules/Dashboard/Doctor/Vitals/DocUserVitalHolder';
import React from 'react';

interface Props {
    params: Promise<{
        patientId: string;
    }>;
}

const DynamicPatientPage = async ({ params }: Props) => {
    try {
        const { patientId } = await params;
        if (!patientId) {
            return <div className="p-4">Invalid Patient ID</div>;
        }
        return (
            <div className="p-4">
                <h1 className="text-xl font-bold">Patient Details</h1>
                <p>Patient ID: {patientId}</p>
                <DocUserVitalHolder patientId={patientId} />
            </div>
        );
    } catch (error) {
        console.error('Error loading patient page:', error);
        return <div className="p-4">Error loading patient details</div>;
    }
};

export default DynamicPatientPage;