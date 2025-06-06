/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button';
import { SingleAppointment, IAppointment } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Heart, MapPin, Video, User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import useSocket from '@/hooks/useSocket';
import { useMessages } from '@/hooks/useMessages';
import FeedbackSection from '../Feedback/FeedbackSection';
import { TeleconsultationActions } from '../../Patient/Appointments/TeleCommunication/TeleconsultationActions';

interface SingleAppointmentPatientDocProps {
    appointment: SingleAppointment;
    token: string;
}

const SingleAppointmentPatientDoc: React.FC<SingleAppointmentPatientDocProps> = ({ appointment, token }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const { isOnline } = useMessages(session?.user?.id as string, socket);
    const [isPatientOnline, setIsPatientOnline] = useState(false);

    // Check patient online status
    useEffect(() => {
        if (isConnected && typeof appointment.patientId !== 'string' && appointment.patientId?._id) {
            setIsPatientOnline(isOnline(appointment.patientId._id));
        } else {
            setIsPatientOnline(false);
        }
    }, [isConnected, appointment.patientId, isOnline]);

    const handleAddRecommendation = async () => {
        try {
            alert('Adding recommendation... (Placeholder for recommendation update)');
            // Placeholder for API call to update recommendations
            /*
            await updateAppointment(appointment._id, {
                vital: {
                    ...appointment.vital,
                    feedback: {
                        ...appointment.vital.feedback,
                        recommendations: `${appointment.vital.feedback.recommendations || ''} \nNew recommendation added.`,
                    },
                },
            }, token);
            */
            router.refresh();
        } catch (error: any) {
            console.error('Failed to add recommendation:', error.message);
            alert('Failed to add recommendation. Please try again.');
        }
    };

    const patient = typeof appointment.patientId === 'string' ? null : appointment.patientId;
    const vital = typeof appointment.vital === 'string' ? null : appointment.vital;
    const prescriptions = vital?.feedback?.prescriptions || [];
    const labTests = vital?.feedback?.labTests || [];

    // Transform appointment to match IAppointment for TeleconsultationActions
    const appointmentForTeleconsultation: IAppointment = {
        ...appointment,
        vital: typeof appointment.vital === 'string' ? appointment.vital : appointment.vital._id,
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto p-6">
                {/* Go Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                        onClick={() => router.push('/doctor/dashboard/appointments')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment Details</h1>

                    {/* Patient Online Status */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-lg font-semibold text-gray-900 truncate">{patient?.name || 'Unknown'}</span>
                        <span
                            className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isPatientOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={isPatientOnline ? 'Online' : 'Offline'}
                        ></span>
                        <span className={`text-sm font-medium ${isPatientOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {isPatientOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Appointment Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Patient */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Patient</p>
                                <p className="text-base font-semibold text-gray-900">{patient?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-600">
                                    Age: {patient?.age || 'N/A'}, Gender: {patient?.gender || 'N/A'}, Blood Group: {patient?.bloodGroup || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-full">
                                <Calendar className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Date</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {format(parseISO(appointment.appointmentDate as string), 'PPP')}
                                </p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Time</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {appointment.appointmentTime} ({appointment.duration} min)
                                </p>
                            </div>
                        </div>

                        {/* Type */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full">
                                {appointment.type === 'in-person' ? (
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                ) : (
                                    <Video className="h-5 w-5 text-purple-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Type</p>
                                <p className="text-base font-semibold text-gray-900 capitalize">{appointment.type}</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                                <Heart className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <span
                                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${appointment.status === 'confirmed'
                                        ? 'bg-green-100 text-green-800'
                                        : appointment.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : appointment.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {appointment.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Teleconsultation Actions */}
                    {appointment.type === 'teleconsultation' && (
                        <TeleconsultationActions appointment={appointmentForTeleconsultation} />
                    )}

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Reason */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Reason</h3>
                            <p className="text-gray-800">{appointment.reason}</p>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Notes</h3>
                                <p className="text-gray-800">{appointment.notes}</p>
                            </div>
                        )}
                        {/* Vital */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Vital</h3>
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-gray-500" />
                                <p className="text-gray-800">
                                    Heart Rate: {vital?.heartRate || 'N/A'} bpm
                                    {', Priority: '}
                                    <span
                                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${vital?.priority === 'low'
                                            ? 'bg-green-100 text-green-800'
                                            : vital?.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {vital?.priority || 'N/A'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Prescriptions */}
                        {prescriptions.length > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Prescriptions</h3>
                                <ul className="list-disc list-inside text-gray-800">
                                    {prescriptions.map((prescription: any, index: number) => (
                                        <li key={index}>
                                            {prescription.medication} ({prescription.brandName}): {prescription.dosage}, {prescription.duration}
                                            <br />
                                            Instructions: {prescription.instructions}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Lab Tests */}
                        {labTests.length > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Lab Tests</h3>
                                <ul className="list-disc list-inside text-gray-800">
                                    {labTests.map((test: any, index: number) => (
                                        <li key={index}>
                                            {test.testName} at {test.labLocation} ({test.scheduledDate})
                                            <br />
                                            Status: {test.status}, Urgency: {test.urgency}
                                            {test.resultLink && (
                                                <a
                                                    href={test.resultLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline ml-2"
                                                >
                                                    View Results
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {vital?.feedback?.recommendations && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Recommendations</h3>
                                <p className="text-gray-800">{vital.feedback.recommendations}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={handleAddRecommendation}
                                >
                                    Add Recommendation
                                </Button>
                            </div>
                        )}
                    </div>
                    {typeof appointment.vital !== 'string' && appointment.vital && (
                        <FeedbackSection
                            initialPrescriptions={appointment.vital.feedback?.prescriptions || []}
                            initialLabTests={appointment.vital.feedback?.labTests || []}
                            initialRecommendations={appointment.vital.feedback?.recommendations || ''}
                            vitalId={appointment.vital._id}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleAppointmentPatientDoc;