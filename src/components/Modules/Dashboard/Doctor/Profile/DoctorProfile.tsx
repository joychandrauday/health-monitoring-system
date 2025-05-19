/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IDoctor } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppDispatch, RootState } from '@/Redux/features/store';
import {
    fetchDoctorRequest,
    fetchDoctorSuccess,
    fetchDoctorFailure,
    updateDoctorRequest,
    updateDoctorSuccess,
    updateDoctorFailure,
} from '@/Redux/features/doctor/doctorSlice';
import { UpdateDoctor } from '@/service/Profile';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface DoctorProfileProps {
    doctorId: string;
    doctorFromDb: IDoctor;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctorId, doctorFromDb }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctor, loading, error } = useSelector((state: RootState) => state.doctor);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<IDoctor | null>(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const { data: session } = useSession();

    console.log('DoctorProfile - Received props:', { doctorId, doctorFromDb });

    // Initialize doctor data
    const initializeDoctorData = () => {
        console.log('Initializing doctor data with doctorFromDb:', doctorFromDb);
        dispatch(fetchDoctorRequest({ doctorId }));
        try {
            if (!doctorFromDb) {
                throw new Error('No doctor data provided');
            }
            dispatch(fetchDoctorSuccess(doctorFromDb));
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to initialize doctor data';
            console.error('Initialize Doctor Error:', errorMessage);
            dispatch(fetchDoctorFailure(errorMessage));
        }
    };

    useEffect(() => {
        if (!doctor && doctorId && doctorFromDb) {
            initializeDoctorData();
        }
    }, []);

    useEffect(() => {
        if (doctor) {
            setFormData(doctor);
            calculateCompletion(doctor);
        }
    }, [doctor]);

    useEffect(() => {
        console.log('Doctor State:', { doctor, loading, error });
    }, [doctor, loading, error]);

    const calculateCompletion = (data: IDoctor) => {
        const fields = [
            data.major,
            data.qualifications?.length > 0,
            data.experience > 0,
            data.bio,
            data.availableDays?.length > 0,
            data.availableTime?.from,
            data.availableTime?.to,
        ];
        const filledFields = fields.filter(Boolean).length;
        const totalFields = fields.length;
        const percentage = Math.round((filledFields / totalFields) * 100);
        setCompletionPercentage(percentage);
        console.log('Profile Completion:', { filledFields, totalFields, percentage });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof IDoctor,
        subfield?: string,
        index?: number
    ) => {
        if (!formData) return;

        if (field === 'qualifications' && index !== undefined) {
            const updatedQualifications = [...formData.qualifications];
            updatedQualifications[index] = e.target.value;
            setFormData({ ...formData, qualifications: updatedQualifications });
        } else if (subfield && field === 'availableTime') {
            setFormData({
                ...formData,
                [field]: { ...formData[field], [subfield]: e.target.value },
            });
        } else {
            setFormData({ ...formData, [field]: e.target.value });
        }
    };

    const addQualification = () => {
        if (!formData) return;
        setFormData({
            ...formData,
            qualifications: [...(formData.qualifications || []), ''],
        });
    };

    const removeQualification = (index: number) => {
        if (!formData) return;
        setFormData({
            ...formData,
            qualifications: formData.qualifications.filter((_, i) => i !== index),
        });
    };

    const handleAvailableDaysChange = (value: string) => {
        if (!formData) return;
        setFormData({
            ...formData,
            availableDays: value.split(',').map((item) => item.trim()).filter(Boolean),
        });
    };

    const handleSave = async () => {
        if (!formData || !doctorId) {
            toast.error('No data to save or invalid doctor ID');
            console.error('Handle Save Error:', { formData, doctorId });
            return;
        }
        dispatch(updateDoctorRequest());
        try {
            const response = await UpdateDoctor(doctorId, formData, session?.user?.accessToken as string);
            console.log('Update API Response:', response.data);
            dispatch(updateDoctorSuccess(response.data));
            setIsEditing(false);
            toast.success('Profile updated successfully!');
            calculateCompletion(formData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            console.error('Update Doctor Error:', errorMessage);
            dispatch(updateDoctorFailure(errorMessage));
            toast.error(errorMessage);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (isEditing && doctor) setFormData(doctor);
    };

    if (loading) {
        return (
            <div className="w-[90%] mx-auto min-h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <Image
                        src="/capsule.gif"
                        alt="Loading"
                        width={48}
                        height={48}
                        priority
                        className="mx-auto"
                    />
                </div>
            </div>
        );
    }

    if (error || !doctor || !formData) {
        return (
            <div className="w-[90%] mx-auto min-h-[50vh] flex items-center justify-center">
                <div className="text-center text-gray-600">
                    <p>{error ? `Error: ${error}` : 'No doctor data available.'}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={initializeDoctorData}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto shadow-lg border-none bg-white/90 backdrop-blur-sm">
                <CardHeader className="relative">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        {formData.user.name}&apos;s Profile
                    </CardTitle>
                    <div className="absolute top-4 right-4">
                        <Progress value={completionPercentage} className="w-24" />
                        <p className="text-sm text-gray-600 mt-1">{completionPercentage}% Complete</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Profile Status</span>
                        <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                            {completionPercentage === 100 ? 'Complete' : 'Incomplete'}
                        </Badge>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">{formData.user.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{formData.user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Major</label>
                        {isEditing ? (
                            <Input
                                value={formData.major || ''}
                                onChange={(e) => handleChange(e, 'major')}
                                className="mt-1"
                                placeholder="e.g., Cardiology"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.major || 'Not specified'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                {formData.qualifications.map((qualification, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <Input
                                            value={qualification}
                                            onChange={(e) => handleChange(e, 'qualifications', undefined, index)}
                                            className="mt-1"
                                            placeholder="e.g., MBBS"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeQualification(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addQualification}
                                    className="mt-2"
                                >
                                    Add Qualification
                                </Button>
                            </div>
                        ) : (
                            <p className="mt-1 text-gray-900">
                                {formData.qualifications?.length > 0
                                    ? formData.qualifications.join(', ')
                                    : 'Not specified'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formData.experience || 0}
                                onChange={(e) => handleChange(e, 'experience')}
                                className="mt-1"
                                min="0"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.experience || 0} years</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio || ''}
                                onChange={(e) => handleChange(e, 'bio')}
                                className="mt-1 w-full border rounded-md p-2"
                                rows={4}
                                placeholder="Tell us about yourself"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.bio || 'Not specified'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Available Days</label>
                        {isEditing ? (
                            <Input
                                value={formData.availableDays?.join(', ') || ''}
                                onChange={(e) => handleAvailableDaysChange(e.target.value)}
                                className="mt-1"
                                placeholder="e.g., Monday, Wednesday, Friday"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">
                                {formData.availableDays?.length > 0
                                    ? formData.availableDays.join(', ')
                                    : 'Not specified'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Available Time</label>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-600">From</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.availableTime?.from || ''}
                                        onChange={(e) => handleChange(e, 'availableTime', 'from')}
                                        className="mt-1"
                                        placeholder="e.g., 10:00 AM"
                                    />
                                ) : (
                                    <p className="mt-1 text-gray-900">
                                        {formData.availableTime?.from || 'Not specified'}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm text-gray-600">To</label>
                                {isEditing ? (
                                    <Input
                                        value={formData.availableTime?.to || ''}
                                        onChange={(e) => handleChange(e, 'availableTime', 'to')}
                                        className="mt-1"
                                        placeholder="e.g., 4:00 PM"
                                    />
                                ) : (
                                    <p className="mt-1 text-gray-900">
                                        {formData.availableTime?.to || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Average Rating</label>
                        <p className="mt-1 text-gray-900">
                            {formData.averageRating ? formData.averageRating.toFixed(2) : '0.00'} / 5
                        </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={toggleEdit}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>Save</Button>
                            </>
                        ) : (
                            <Button onClick={toggleEdit}>Edit Profile</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorProfile;