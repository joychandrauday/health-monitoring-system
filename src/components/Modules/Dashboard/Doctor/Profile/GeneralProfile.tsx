/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { AppDispatch, RootState } from '@/Redux/features/store';
import femaleAvatar from '../../../../../../public/avatar_female.png';
import maleAvatar from '../../../../../../public/avatar_male.png';
import {
    fetchUserRequest,
    fetchUserSuccess,
    fetchUserFailure,
    updateUserRequest,
    updateUserSuccess,
    updateUserFailure,
} from '@/Redux/features/user/userSlice';
import { getGeneralProfile, UpdateGeneralProfile } from '@/service/Profile';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import LoadingPage from '@/app/loading';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

export const GeneralProfile = () => {
    const [user, setUser] = useState<Partial<User>>({});
    const dispatch = useDispatch<AppDispatch>();
    const { user: reduxUser, loading, error } = useSelector((state: RootState) => state.user);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User> | null>(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const { data: session, status } = useSession();
    const { uploadImage, imageUrl, isUploading, error: uploadError } = useCloudinaryUpload(); // Use the upload hook

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUser = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) {
                const errorMessage = 'No valid session or access token';
                dispatch(fetchUserFailure(errorMessage));
                toast.error(errorMessage);
                return;
            }

            dispatch(fetchUserRequest({ userId: session.user.id }));
            try {
                const userData = await getGeneralProfile(session.user.id, session.user.accessToken);
                setUser(userData);
                dispatch(fetchUserSuccess(userData));
            } catch (error: any) {
                const errorMessage = error.message || 'Failed to fetch user';
                dispatch(fetchUserFailure(errorMessage));
                toast.error(errorMessage);
            }
        };

        if (status === 'authenticated') {
            fetchUser();
        }
    }, [status, session, dispatch]);

    // Update formData and completion percentage when reduxUser or imageUrl changes
    useEffect(() => {
        if (reduxUser) {
            const newFormData = {
                name: reduxUser.name || '',
                email: reduxUser.email || '',
                bio: reduxUser.bio || '',
                avatar: imageUrl || reduxUser.avatar || '', // Use uploaded imageUrl if available
                gender: reduxUser.gender || '',
                bloodGroup: reduxUser.bloodGroup || '',
                age: reduxUser.age || 0,
                phone: reduxUser.phone || '',
                address: {
                    street: reduxUser.address?.street || '',
                    city: reduxUser.address?.city || '',
                    state: reduxUser.address?.state || '',
                    country: reduxUser.address?.country || '',
                    postalCode: reduxUser.address?.postalCode || '',
                },
            };
            setFormData(newFormData);
            calculateCompletion(newFormData);
        }
    }, [reduxUser, imageUrl]); // Add imageUrl to dependencies

    // Handle upload errors
    useEffect(() => {
        if (uploadError) {
            toast.error(uploadError);
        }
    }, [uploadError]);

    const calculateCompletion = (data: Partial<User>) => {
        const fields = [
            data.name,
            data.email,
            data.bio,
            data.avatar,
            data.gender,
            data.bloodGroup,
            data.age && data.age > 0,
            data.phone,
            data.address?.street,
            data.address?.city,
            data.address?.state,
            data.address?.country,
            data.address?.postalCode,
        ];
        const filledFields = fields.filter(Boolean).length;
        const totalFields = fields.length;
        const percentage = Math.round((filledFields / totalFields) * 100);
        setCompletionPercentage(percentage);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        field: keyof User,
        subfield?: keyof User['address']
    ) => {
        if (!formData) return;
        let updatedFormData: Partial<User>;
        if (subfield && formData.address) {
            updatedFormData = {
                ...formData,
                address: { ...formData.address, [subfield]: e.target.value },
            };
        } else {
            updatedFormData = { ...formData, [field]: e.target.value };
        }
        setFormData(updatedFormData);
        calculateCompletion(updatedFormData);
    };

    // Handle image file selection and upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            const url = await uploadImage(file);
            setFormData((prev) => (prev ? { ...prev, avatar: url } : prev));
            calculateCompletion({ ...formData!, avatar: url });
            toast.success('Image uploaded successfully');
        } catch (err) {
            // Error is handled by useCloudinaryUpload and displayed via toast
        }
    };

    const handleSave = async () => {
        if (!formData || !user._id || !session?.user?.accessToken) {
            toast.error('Invalid data, user ID, or access token');
            dispatch(updateUserFailure('Invalid data or session'));
            return;
        }

        const updateData: Partial<User> = {
            name: formData.name,
            email: formData.email,
            bio: formData.bio,
            avatar: formData.avatar,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            age: formData.age,
            phone: formData.phone,
            address: formData.address,
        };

        dispatch(updateUserRequest());
        try {
            const response = await UpdateGeneralProfile(
                user._id,
                updateData,
                session.user.accessToken
            );
            dispatch(updateUserSuccess(response));
            setIsEditing(false);
            toast.success('Profile updated successfully!');
            calculateCompletion(updateData);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update profile';
            dispatch(updateUserFailure(errorMessage));
            toast.error(errorMessage);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (isEditing && reduxUser) {
            const resetFormData = {
                name: reduxUser.name || '',
                email: reduxUser.email || '',
                bio: reduxUser.bio || '',
                avatar: reduxUser.avatar || '',
                gender: reduxUser.gender || '',
                bloodGroup: reduxUser.bloodGroup || '',
                age: reduxUser.age || 0,
                phone: reduxUser.phone || '',
                address: {
                    street: reduxUser.address?.street || '',
                    city: reduxUser.address?.city || '',
                    state: reduxUser.address?.state || '',
                    country: reduxUser.address?.country || '',
                    postalCode: reduxUser.address?.postalCode || '',
                },
            };
            setFormData(resetFormData);
            calculateCompletion(resetFormData);
        }
    };

    const getAvatarSrc = () => {
        if (formData?.avatar && formData.avatar !== 'none' && formData.avatar.startsWith('http')) {
            return formData.avatar;
        }
        if (formData?.gender === 'male') {
            return maleAvatar.src;
        }
        if (formData?.gender === 'female') {
            return femaleAvatar.src;
        }
        return '/avatar_male.png';
    };

    if (status === 'loading' || loading) {
        return <LoadingPage />;
    }

    if (error || !reduxUser || !formData) {
        return (
            <div className="text-center text-gray-600">
                <p>{error || 'No user data available.'}</p>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (status === 'authenticated' && session?.user?.id && session?.user?.accessToken) {
                            dispatch(fetchUserRequest({ userId: session.user.id }));
                            getGeneralProfile(session.user.id, session.user.accessToken)
                                .then((userData) => {
                                    setUser(userData);
                                    dispatch(fetchUserSuccess(userData));
                                })
                                .catch((error: any) => {
                                    const errorMessage = error.message || 'Failed to fetch user';
                                    dispatch(fetchUserFailure(errorMessage));
                                    toast.error(errorMessage);
                                });
                        }
                    }}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <Card className="w-full shadow-lg border-none bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                        <Image
                            src={getAvatarSrc()}
                            alt={formData.name || 'User'}
                            width={128}
                            height={128}
                            className="object-cover rounded-full"
                            priority={true}
                            sizes="(max-width: 640px) 96px, 128px"
                            placeholder="blur"
                            blurDataURL="/default-avatar.png"
                        />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gray-800">{formData.name}</h2>
                            <div className="flex flex-col items-end">
                                <Progress value={completionPercentage} className="w-24 h-2" />
                                <p className="text-sm text-gray-600 mt-1">
                                    {completionPercentage}% Complete
                                </p>
                            </div>
                        </div>
                        {isEditing ? (
                            <Textarea
                                value={formData.bio || ''}
                                onChange={(e) => handleChange(e, 'bio')}
                                className="mt-2 w-full"
                                placeholder="Tell us about yourself..."
                                rows={4}
                            />
                        ) : (
                            <p className="mt-2 text-gray-600">{formData.bio || 'No bio provided.'}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Profile Status</span>
                    <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                        {completionPercentage === 100 ? 'Complete' : 'Incomplete'}
                    </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        {isEditing ? (
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => handleChange(e, 'name')}
                                className="mt-1"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        {isEditing ? (
                            <Input
                                value={formData.email || ''}
                                onChange={(e) => handleChange(e, 'email')}
                                className="mt-1"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Avatar</label>
                        {isEditing ? (
                            <div className="mt-1">
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleImageChange}
                                    className="mb-2"
                                    disabled={isUploading}
                                />
                                {isUploading && <p className="text-sm text-gray-600">Uploading...</p>}
                                {formData.avatar && (
                                    <Image
                                        src={formData.avatar}
                                        alt="Avatar Preview"
                                        width={64}
                                        height={64}
                                        className="object-cover rounded-full mt-2"
                                    />
                                )}
                            </div>
                        ) : (
                            <Image
                                src={getAvatarSrc()}
                                alt={formData.name || 'User'}
                                width={64}
                                height={64}
                                className="object-cover rounded-full mt-1"
                                priority={true}
                                sizes="(max-width: 640px) 48px, 64px"
                                placeholder="blur"
                                blurDataURL="/default-avatar.png"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        {isEditing ? (
                            <select
                                value={formData.gender || ''}
                                onChange={(e) => handleChange(e, 'gender')}
                                className="mt-1 block w-full border rounded-md p-2"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.gender || 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        {isEditing ? (
                            <select
                                value={formData.bloodGroup || ''}
                                onChange={(e) => handleChange(e, 'bloodGroup')}
                                className="mt-1 block w-full border rounded-md p-2"
                            >
                                <option value="">Select Blood Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                    <option key={bg} value={bg}>
                                        {bg}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.bloodGroup || 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formData.age || 0}
                                onChange={(e) => handleChange(e, 'age')}
                                className="mt-1"
                                min="0"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.age ? `${formData.age} years` : 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        {isEditing ? (
                            <Input
                                value={formData.phone || ''}
                                onChange={(e) => handleChange(e, 'phone')}
                                className="mt-1"
                                placeholder="+1234567890"
                            />
                        ) : (
                            <p className="mt-1 text-gray-900">{formData.phone || 'Not set'}</p>
                        )}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Input
                                    value={formData.address?.street || ''}
                                    onChange={(e) => handleChange(e, 'address', 'street')}
                                    className="mt-1"
                                    placeholder="Street"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        value={formData.address?.city || ''}
                                        onChange={(e) => handleChange(e, 'address', 'city')}
                                        className="mt-1"
                                        placeholder="City"
                                    />
                                    <Input
                                        value={formData.address?.state || ''}
                                        onChange={(e) => handleChange(e, 'address', 'state')}
                                        className="mt-1"
                                        placeholder="State"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        value={formData.address?.country || ''}
                                        onChange={(e) => handleChange(e, 'address', 'country')}
                                        className="mt-1"
                                        placeholder="Country"
                                    />
                                    <Input
                                        value={formData.address?.postalCode || ''}
                                        onChange={(e) => handleChange(e, 'address', 'postalCode')}
                                        className="mt-1"
                                        placeholder="Postal Code"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-gray-900">
                                {formData.address?.street || formData.address?.city || formData.address?.state || formData.address?.country || formData.address?.postalCode
                                    ? `${formData.address.street || ''}, ${formData.address.city || ''}, ${formData.address.state || ''}, ${formData.address.country || ''} ${formData.address.postalCode || ''}`.trim()
                                    : 'Not set'}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={toggleEdit}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isUploading}>
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button onClick={toggleEdit}>Edit Profile</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};