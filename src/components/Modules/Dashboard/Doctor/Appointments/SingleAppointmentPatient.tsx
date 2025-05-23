/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Button } from '@/components/ui/button';
import { IAppointment } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, DollarSign, Heart, MapPin, Stethoscope, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { TeleconsultationActions } from '../../Patient/Appointments/TeleCommunication/TeleconsultationActions';
interface SingleAppointmentPatientProps {
    appointment: IAppointment,
    token: string
}
const SingleAppointmentPatient: React.FC<SingleAppointmentPatientProps> = ({ appointment }) => {
    const router = useRouter();

    const handlePayment = async () => {
        try {
            alert('Processing payment... (Placeholder for payment gateway)');
            // Placeholder for payment integration (e.g., Stripe, PayPal)
            /*
            await updateAppointment(appointment._id, {
              payment: { ...appointment.payment, status: 'completed', paidAt: new Date() },
            }, token);
            */
            router.refresh();
        } catch (error: any) {
            console.error('Payment failed:', error.message);
            alert('Payment failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto p-6">
                {/* Go Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                        onClick={() => router.push('/patient/dashboard/appointments')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment Details</h1>

                    {/* Appointment Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Doctor */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full">
                                <Stethoscope className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Doctor</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {(appointment.doctorId as any)?.name || 'Unknown'}
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
                                    {format(new Date(appointment.appointmentDate), 'PPP')}
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
                                    {format(new Date(`1970-01-01T${appointment.appointmentTime}:00`), 'h:mm a')} ({appointment.duration} min)
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

                        {/* Payment */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Payment</p>
                                {appointment.payment?.status ? (
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${appointment.payment.status === 'completed'
                                                ? 'bg-green-200 text-green-900 border-green-400'
                                                : appointment.payment.status === 'pending'
                                                    ? 'bg-yellow-200 text-yellow-900 border-yellow-400'
                                                    : 'bg-red-200 text-red-900 border-red-400'
                                                }`}
                                        >
                                            {appointment.payment.status} (${appointment.payment.amount} {appointment.payment.currency})
                                        </span>
                                        {appointment.payment.status === 'pending' && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={handlePayment}
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-500">Not Paid</span>
                                )}
                            </div>
                        </div>
                    </div>

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
                                    Heart Rate: {(appointment.vital as any)?.heartRate || 'N/A'} bpm
                                    {', Priority: '}
                                    <span
                                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${(appointment.vital as any)?.priority === 'low'
                                            ? 'bg-green-100 text-green-800'
                                            : (appointment.vital as any)?.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {(appointment.vital as any)?.priority || 'N/A'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Type-Specific Details */}
                    {appointment.type === 'in-person' ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">In-Person Appointment Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <p className="text-gray-800">
                                        <span className="font-medium">Location:</span> {(appointment.doctorId as any)?.address?.street || 'TBA'}, {(appointment.doctorId as any)?.address?.city || 'TBA'}
                                    </p>
                                </div>
                                <p className="text-gray-800">
                                    <span className="font-medium">Instructions:</span> Please arrive 10 minutes early and bring any relevant medical records.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teleconsultation Actions</h3>
                            <TeleconsultationActions appointmentId={appointment._id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleAppointmentPatient;