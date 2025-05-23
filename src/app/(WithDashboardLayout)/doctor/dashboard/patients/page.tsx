import { GetPatientsByDocId } from '@/service/VitalService';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Page = async () => {
    const session = await getServerSession(authOptions)
    const patients = await GetPatientsByDocId({ docId: session?.user?.id as string })
    return (
        <div>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Patients</h1>
                {patients.patients.length === 0 ? (
                    <p className="text-gray-500 text-lg">No patients found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {patients.patients.map((patient) => (
                            <Link
                                key={patient._id}
                                href={`/doctor/dashboard/vitals/${patient._id}`}
                                className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <Image
                                    src={patient.avatar}
                                    alt={`${patient.name}'s avatar`}
                                    width={64}
                                    height={64}
                                    className="rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{patient.name}</h2>
                                    <p className="text-sm text-gray-500">View Vitals</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Page;
