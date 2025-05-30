'use client';
import { Vital, User } from '@/types';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';
import FeedbackSection from '../Feedback/FeedbackSection';

interface SingleVitalsProps {
    vital: Vital;
}

const SingleVitals = ({ vital }: SingleVitalsProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    if (!vital) {
        return <div className="p-4">Vital data not found</div>;
    }

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    // Safely extract patient details
    const patient = typeof vital.patientId === 'object' && vital.patientId ? (vital.patientId as User) : null;
    const patientName = patient?.name || (typeof vital.patientId === 'string' ? `ID: ${vital.patientId}` : 'Unknown');
    const patientEmail = patient?.email || '-';
    const patientAvatar = patient?.avatar || '/default-avatar.png';
    return (
        <div className="container mx-auto p-6">
            <div className="">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">Vital Details</h2>
                    <div className="flex items-center gap-4">
                        <Image
                            src={patientAvatar}
                            alt={`${patientName}'s avatar`}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200"
                        />
                        <div>
                            <p className="text-gray-900 font-semibold text-lg">{patientName}</p>
                            <p className="text-gray-600 text-sm">{patientEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vital Metrics */}
                    <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800">Vital Metrics</h3>
                        <div className="bg-white rounded-lg p-4 shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
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
                                    className={`capitalize px-2 py-1 rounded-full text-sm ${vital.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : vital.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : vital.status === 'in-progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {vital.status || '-'}
                                </span>
                            </p>
                            <p><strong>Priority:</strong>{' '}
                                <span
                                    className={`capitalize px-2 py-1 rounded-full text-sm ${vital.priority === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : vital.priority === 'medium'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-800'
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
                            <p><strong>Notes:</strong> {vital.notes || '-'}</p>
                        </div>
                    </div>


                    {/* Visuals and Feedback */}
                    <div className="space-y-4 lg:col-span-1">
                        <h3 className="text-xl font-semibold text-gray-800">Visuals</h3>
                        <div className="bg-white rounded-lg p-4 shadow">
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
                                                className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity duration-200 border border-gray-200"
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
                <FeedbackSection
                    initialPrescriptions={vital.feedback?.prescriptions || []}
                    initialLabTests={vital.feedback?.labTests || []}
                    initialRecommendations={vital.feedback?.recommendations || ''}
                    vitalId={vital._id}
                />
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
                            className="w-full h-auto object-contain rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SingleVitals;