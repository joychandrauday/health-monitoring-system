/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { Vital, User } from '@/types';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { UpdateLabTest } from '@/service/feedback';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import PrescriptionGenerator from './PrescriptionGenerator';

interface SingleVitalPatientProps {
    vital: Vital;
}

const SingleVitalPatient = ({ vital }: SingleVitalPatientProps) => {
    const { data: session } = useSession();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [resultLinkInput, setResultLinkInput] = useState<{ [key: number]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<{ [key: number]: boolean }>({});
    if (!vital.success) {
        return (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14" />
                    </svg>
                    Vital Data Not Found
                </h3>
                <p>Please ensure the correct vital id exists or try again later.</p>
            </div>
        );
    }

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const handleResultLinkSubmit = async (index: number, testName: string) => {
        const resultLink = resultLinkInput[index];
        if (!resultLink || !/^(https?:\/\/)/.test(resultLink)) {
            toast.error('Please enter a valid URL');
            return;
        }

        setIsSubmitting({ ...isSubmitting, [index]: true });
        try {
            const labTest = vital.feedback?.labTests?.[index];
            const STATUS_COMPLETED = "completed" as const;

            const updateData = {
                testName: labTest?.testName || testName,
                urgency: labTest?.urgency || 'routine',
                notes: labTest?.notes || '',
                scheduledDate: labTest?.scheduledDate || '',
                labLocation: labTest?.labLocation || '',
                status: STATUS_COMPLETED,
                resultLink: resultLink,
                physicianNote: labTest?.physicianNote || '',
            };

            await UpdateLabTest(vital._id, updateData, session?.user?.accessToken as string);
            toast.success('Result link updated successfully!');
            setResultLinkInput({ ...resultLinkInput, [index]: '' });
        } catch (error) {
            toast.error('Failed to update result link');
        } finally {
            setIsSubmitting({ ...isSubmitting, [index]: false });
        }
    };

    // Safely extract patient details
    const patient = typeof vital.patientId === 'object' && vital.patientId ? (vital.patientId as User) : null;
    const patientName = patient?.name || (typeof vital.patientId === 'string' ? `ID: ${vital.patientId}` : 'Unknown');
    const patientEmail = patient?.email || '-';
    const patientAvatar = patient?.avatar || '/default-avatar.png';
    console.log(vital);

    return (
        <div className="container mx-auto p-6 max-w-7xl overflow-x-hidden">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl shadow-md border border-teal-100">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vital Details</h2>
                    <div className="flex items-center gap-4">
                        <Image
                            src={patientAvatar}
                            alt={`${patientName}'s avatar`}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover border-2 border-teal-300 shadow-md"
                        />
                        <div>
                            <p className="text-gray-900 font-semibold text-lg">{patientName}</p>
                            <p className="text-gray-500 text-sm">{patientEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vital Metrics */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-50 transition-all duration-200 hover:shadow-lg">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Vital Metrics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
                                <p><strong>Date:</strong>{' '}
                                    {vital.timestamp
                                        ? new Date(vital.timestamp).toLocaleString('en-US', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })
                                        : '-'}
                                </p>
                                <p><strong>Updated At:</strong>{' '}
                                    {vital.updatedAt
                                        ? new Date(vital.updatedAt).toLocaleString('en-US', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })
                                        : '-'}
                                </p>
                                <p><strong>Status:</strong>{' '}
                                    <span
                                        className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${vital.status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : vital.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : vital.status === 'in-progress'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {vital.status || '-'}
                                    </span>
                                </p>
                                <p><strong>Priority:</strong>{' '}
                                    <span
                                        className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${vital.priority === 'high'
                                            ? 'bg-rose-100 text-rose-700'
                                            : vital.priority === 'medium'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {vital.priority || '-'}
                                    </span>
                                </p>
                                <p><strong>Heart Rate:</strong> {vital.heartRate ? `${vital.heartRate} bpm` : '-'}</p>
                                <p><strong>Blood Pressure:</strong>{' '}
                                    {vital.bloodPressure
                                        ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
                                        : '-'}
                                </p>
                                <p><strong>Glucose Level:</strong> {vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : '-'}</p>
                                <p><strong>Oxygen Saturation:</strong> {vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}</p>
                                <p><strong>Temperature:</strong> {vital.temperature ? `${vital.temperature}°C` : '-'}</p>
                                <p><strong>Respiratory Rate:</strong> {vital.respiratoryRate ? `${vital.respiratoryRate}/min` : '-'}</p>
                                <p><strong>Pain Level:</strong> {vital.painLevel ? `${vital.painLevel}/10` : '-'}</p>
                                <p><strong>Injury:</strong>{' '}
                                    {vital.injury && vital.injury.type !== 'none'
                                        ? `${vital.injury.type} (${vital.injury.severity || 'N/A'}) ${vital.injury.description || ''}`
                                        : '-'}
                                </p>
                                <p className="sm:col-span-2 lg:col-span-3"><strong>Notes:</strong> {vital.notes || '-'}</p>
                            </div>
                        </div>

                        {/* Visuals and Lab Tests */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Recommendations */}
                            {vital.feedback?.recommendations && (
                                <div className="w-full rounded-xl p-6 border-l-4 border-yellow-500 bg-yellow-50 shadow-sm transition-all duration-200">
                                    <h3 className="text-xl font-semibold text-yellow-800 mb-3 tracking-tight">
                                        ⚠️ Recommendations
                                    </h3>
                                    <p className="text-yellow-700 leading-relaxed">
                                        {vital.feedback.recommendations}
                                    </p>
                                </div>
                            )}

                            {/* Visuals */}
                            <div className="bg-white w-full rounded-xl p-6 shadow-md border border-gray-50 transition-all duration-200 hover:shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Visuals</h3>
                                {vital.visuals && vital.visuals.length > 0 ? (
                                    <div className="flex gap-3 flex-wrap">
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
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 object-cover rounded-lg hover:opacity-90 transition-opacity duration-300 border border-gray-100"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No visuals available</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <PrescriptionGenerator vital={vital} />

                </div>
                {/* Lab Tests */}
                {vital.feedback?.labTests && vital.feedback.labTests.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-50 transition-all duration-200 hover:shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 tracking-tight">Lab Tests</h3>
                        <div className="w-full max-w-full overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Test Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Urgency</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Scheduled</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Result Link</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {vital.feedback.labTests.map((test, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{test.testName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                <span
                                                    className={`capitalize px-2 py-1 rounded-full text-xs ${test.urgency === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
                                                        }`}
                                                >
                                                    {test.urgency}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{test.scheduledDate || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{test.labLocation || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                <span
                                                    className={`capitalize px-2 py-1 rounded-full text-xs ${test.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : test.status === 'pending'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {test.status || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {test.resultLink ? (
                                                    <a href={test.resultLink} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 transition-colors duration-150">
                                                        View Result
                                                    </a>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="url"
                                                            value={resultLinkInput[index] || ''}
                                                            onChange={(e) => setResultLinkInput({ ...resultLinkInput, [index]: e.target.value })}
                                                            placeholder="Enter result link"
                                                            className="p-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 w-32 transition-colors duration-150"
                                                        />
                                                        <button
                                                            onClick={() => handleResultLinkSubmit(index, test.testName)}
                                                            disabled={isSubmitting[index] || !resultLinkInput[index]}
                                                            className={`px-2 py-1 text-sm rounded-lg transition-colors duration-150 ${isSubmitting[index] || !resultLinkInput[index]
                                                                ? 'bg-gray-200 cursor-not-allowed'
                                                                : 'bg-teal-600 text-white hover:bg-teal-700'
                                                                }`}
                                                        >
                                                            {isSubmitting[index] ? 'Submitting...' : 'Submit'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">{test.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
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
                            className="w-full h-auto object-contain rounded-xl"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SingleVitalPatient;