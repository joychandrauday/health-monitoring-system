/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Stethoscope, MessageSquare, Heart } from 'lucide-react';
import { IAppointment, IDoctor, Vital } from '@/types';
import { GetAllDocsSocket } from '@/service/Doctor';
import { createAppointment } from '@/service/Appointments';
import { Meta } from '../../Admin/Doctor/DocRequestTable';
import { GetVitalsByUserId } from '@/service/VitalService';
import { useSession } from 'next-auth/react';

interface FormData {
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    type: 'in-person' | 'teleconsultation';
    reason: string;
    vital: string;
    notes?: string;

}

const BookAppointment: React.FC<{ token: string }> = ({ token }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [formData, setFormData] = useState<FormData>({
        doctorId: '',
        patientId: '',
        appointmentDate: '',
        type: 'in-person',
        reason: '',
        vital: '',
        notes: '',
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [vitalsHistory, setVitalsHistory] = useState<Vital[]>([]);
    const [allDoctors, setAllDoctors] = useState<IDoctor[]>([]);
    const [vitalsMeta, setVitalsMeta] = useState<Meta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    useEffect(() => {
        if (session?.user?.id) {
            setFormData((prev) => ({ ...prev, patientId: session?.user?.id as string }));
        }

        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        const fetchVitals = async () => {
            try {
                const response = await GetVitalsByUserId({
                    userId: session?.user?.id as string,
                    token: token as string,
                    page: pageFromUrl,
                });
                setVitalsHistory(response.vitals);
                setVitalsMeta({
                    ...response.vitamMeta, // Note: 'vitamMeta' seems to be a typo in your original code; should be 'vitalsMeta'
                    page: pageFromUrl,
                });
            } catch (error) {
                console.error('❌ Failed to fetch vitals history:', error);
            }
        };

        const fetchDoctors = async () => {
            try {
                if (!token) return;
                const { doctors } = await GetAllDocsSocket({
                    page: 1,
                    limit: 20,
                    token: token,
                });
                setAllDoctors(doctors);
            } catch (error) {
                console.error('❌ Failed to fetch doctors:', error);
            }
        };

        fetchVitals();
        fetchDoctors();
    }, [session?.user?.id]);

    const handleChange = (
        key: keyof FormData,
        value: string | { amount: number; currency: string; status: 'pending' | 'completed' | 'failed' | 'refunded' },
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (
            !formData.doctorId ||
            !formData.patientId ||
            !formData.appointmentDate ||
            !formData.type ||
            !formData.reason ||
            !formData.vital
        ) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        // Validate appointmentDate format
        let formattedDate: string;
        try {
            const date = new Date(formData.appointmentDate);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            formattedDate = date.toISOString(); // Converts to "2025-06-01T00:00:00.000Z"
        } catch {
            setError('Invalid date format. Please select a valid date and time.');
            setIsSubmitting(false);
            return;
        }

        const data: Partial<IAppointment> = {
            doctorId: formData.doctorId,
            patientId: formData.patientId,
            appointmentDate: formattedDate,
            type: formData.type,
            vital: formData.vital,
            reason: formData.reason,
            notes: formData.notes || undefined,
            duration: 30,

        };

        try {
            console.log(data);
            const result = await createAppointment(data, token);
            if (result) {
                setSuccess('You Have booked an appointment!');
                setFormData({
                    doctorId: '',
                    patientId: session?.user?.id as string || '',
                    appointmentDate: '',
                    type: 'in-person',
                    reason: '',
                    vital: '',
                    notes: '',

                });
                setTimeout(() => router.push('/patient/dashboard/appointments'), 2000);
            } else {
                setError('something went wrong!');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to book appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <Button
                        variant="outline"
                        className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                        onClick={() => router.push('/patient/dashboard/appointments')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Appointments
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Book an Appointment</h1>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-4 justify-between items-center">
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Stethoscope className="h-4 w-4 mr-2 text-gray-500" />
                                    Doctor
                                </label>
                                <Select
                                    value={formData.doctorId}
                                    onValueChange={(value) => handleChange('doctorId', value)}
                                >
                                    <SelectTrigger className="w-full bg-white border-gray-300">
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {allDoctors.map((doctor) => (
                                            <SelectItem key={doctor._id} value={doctor.user._id as string}>
                                                {doctor.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Heart className="h-4 w-4 mr-2 text-gray-500" />
                                    Vital
                                </label>
                                <Select
                                    value={formData.vital}
                                    onValueChange={(value) => handleChange('vital', value)}
                                >
                                    <SelectTrigger className="w-full bg-white border-gray-300">
                                        <SelectValue placeholder="Select a Vital" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {vitalsHistory.map((vital) => (
                                            <SelectItem key={vital._id} value={vital._id as string}>
                                                {vital.heartRate} bpm / {new Date(vital.timestamp).toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                Appointment Date & Time
                            </label>
                            <Input
                                type="datetime-local"
                                value={formData.appointmentDate}
                                onChange={(e) => handleChange('appointmentDate', e.target.value)}
                                className="w-full bg-white border-gray-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                                Appointment Type
                            </label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange('type', value as 'in-person' | 'teleconsultation')}
                            >
                                <SelectTrigger className="w-full bg-white border-gray-300">
                                    <SelectValue placeholder="Select appointment type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="in-person">In-Person</SelectItem>
                                    <SelectItem value="teleconsultation">Teleconsultation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <Textarea
                                value={formData.reason}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                className="w-full bg-white border-gray-300"
                                placeholder="e.g., General Checkup"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                className="w-full bg-white border-gray-300"
                                placeholder="Any additional information"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Booking...' : 'Book Appointment'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;