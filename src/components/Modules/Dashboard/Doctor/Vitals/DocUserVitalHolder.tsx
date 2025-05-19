'use client';
import { GetVitalsByUserId } from '@/service/VitalService';
import { Vital } from '@/types';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Meta } from '../../Admin/Doctor/DocRequestTable';
import TablePagination from '@/components/utils/TablePagination';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DocUserVitalHolder = ({ patientId }: { patientId: string }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [vitalsHistory, setVitalsHistory] = useState<Vital[]>([]);
    const [vitalsMeta, setVitalsMeta] = useState<Meta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }

        if (!session) {
            router.push('/403');
            return;
        }

        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

        const fetchVitals = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await GetVitalsByUserId({
                    userId: patientId,
                    token: session?.user?.accessToken as string,
                    page: pageFromUrl,
                });
                setVitalsHistory(response.vitals);
                setVitalsMeta({
                    ...response.vitamMeta,
                    page: pageFromUrl,
                });
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch vitals history');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVitals();
    }, [searchParams, patientId, session, status, router]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vitals History</h2>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-lg font-medium">{error}</p>
                ) : vitalsHistory.length === 0 ? (
                    <p className="text-gray-500 text-lg">No vitals recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Heart Rate</th>
                                    <th className="p-4">Blood Pressure</th>
                                    <th className="p-4">Glucose</th>
                                    <th className="p-4">O2 Sat</th>
                                    <th className="p-4">Temp</th>
                                    <th className="p-4">Resp Rate</th>
                                    <th className="p-4">Pain</th>
                                    <th className="p-4">Injury</th>
                                    <th className="p-4">Visuals</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vitalsHistory.map((vital) => (
                                    <tr
                                        key={vital._id}
                                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                                        role="row"
                                    >
                                        <td className="p-4 text-gray-600">
                                            {vital.timestamp
                                                ? new Date(vital.timestamp).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })
                                                : 'N/A'}
                                        </td>

                                        <td className="p-4 text-gray-600">{vital.heartRate ? `${vital.heartRate} bpm` : '-'}</td>
                                        <td className="p-4 text-gray-600">
                                            {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg` : '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">{vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : '-'}</td>
                                        <td className="p-4 text-gray-600">{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}</td>
                                        <td className="p-4 text-gray-600">{vital.temperature ? `${vital.temperature}°C` : '-'}</td>
                                        <td className="p-4 text-gray-600">{vital.respiratoryRate ? `${vital.respiratoryRate}/min` : '-'}</td>
                                        <td className="p-4 text-gray-600">{vital.painLevel ? `${vital.painLevel}/10` : '-'}</td>
                                        <td className="p-4 text-gray-600">
                                            {vital.injury && vital.injury.type !== 'none'
                                                ? `${vital.injury.type} (${vital.injury.severity || 'N/A'}) ${vital.injury.description || ''}`
                                                : '-'}
                                        </td>
                                        <td className="p-4">
                                            {vital.visuals && vital.visuals.length > 0 ? (
                                                <div className="flex gap-2">
                                                    {vital.visuals.map((visual, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleImageClick(visual)}
                                                            className="focus:outline-none"
                                                            aria-label={`View visual ${index + 1}`}
                                                        >
                                                            <Image
                                                                src={visual}
                                                                alt={`Vital visual ${index + 1}`}
                                                                width={40}
                                                                height={40}
                                                                className="w-10 h-10 object-cover rounded hover:opacity-80 transition-opacity duration-150"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <TablePagination totalPage={vitalsMeta.totalPages} />
                    </div>
                )}
            </div>

            {/* Modal for full-size image viewing */}
            <Dialog open={!!selectedImage} onOpenChange={closeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Vital Image</DialogTitle>
                    </DialogHeader>
                    {selectedImage && (
                        <Image
                            src={selectedImage}
                            alt="Full-size vital image"
                            width={400}
                            height={400}
                            className="w-full h-auto object-contain rounded"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocUserVitalHolder;