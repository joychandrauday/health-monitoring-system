'use client';
import { Vital, User } from '@/types';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';

interface SingleVitalsProps {
    vital: Vital;
}

const SingleVitals = ({ vital }: SingleVitalsProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Vital Details</h2>
                <div className="patient-details flex items-center gap-4">
                    <Image
                        src={patientAvatar}
                        alt={`${patientName}'s avatar`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-gray-800 font-semibold">{patientName}</p>
                        <p className="text-gray-600 text-sm">{patientEmail}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600">
                        <strong>Date:</strong>{' '}
                        {vital.timestamp
                            ? new Date(vital.timestamp).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })
                            : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Heart Rate:</strong> {vital.heartRate ? `${vital.heartRate} bpm` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Blood Pressure:</strong>{' '}
                        {vital.bloodPressure
                            ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
                            : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Glucose Level:</strong> {vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Oxygen Saturation:</strong>{' '}
                        {vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Temperature:</strong> {vital.temperature ? `${vital.temperature}°C` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Respiratory Rate:</strong>{' '}
                        {vital.respiratoryRate ? `${vital.respiratoryRate}/min` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Pain Level:</strong> {vital.painLevel ? `${vital.painLevel}/10` : '-'}
                    </p>
                    <p className="text-gray-600">
                        <strong>Injury:</strong>{' '}
                        {vital.injury && vital.injury.type !== 'none'
                            ? `${vital.injury.type} (${vital.injury.severity || 'N/A'}) ${vital.injury.description || ''}`
                            : '-'}
                    </p>
                </div>
                <div>
                    <p className="text-gray-600 font-semibold mb-2">Visuals:</p>
                    {vital.visuals && vital.visuals.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
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
                                        className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity duration-150"
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No visuals available</p>
                    )}
                </div>
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

export default SingleVitals;