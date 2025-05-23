'use client';

import { getPatientAnalytics, VitalData } from '@/service/Analytics';
import { User } from '@/types';
import React, { useEffect, useState } from 'react';
import PatientAnalytics from './PatientAnalytics';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AnalyticsHolder = ({ patients }: { patients: User[] }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [analytics, setAnalytics] = useState<VitalData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!selectedUser?._id || !session?.user?.accessToken) return;
            setIsLoading(true);
            setError(null);
            try {
                const analyticsData = await getPatientAnalytics({
                    patientId: selectedUser._id,
                    token: session.user.accessToken,
                });
                setAnalytics(analyticsData);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
                setError(message);
                setAnalytics(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedUser?._id, session?.user?.accessToken]);

    // Handle authentication loading or unauthenticated states
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-semibold text-gray-700">Please log in to view patient analytics</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">Patient Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        {/* Patient Selector */}
                        <div className="w-full sm:w-80">
                            <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Patient
                            </label>
                            <Select
                                value={selectedUser?._id || ''}
                                onValueChange={(value) => {
                                    const user = patients.find((p) => p._id === value) || null;
                                    setSelectedUser(user);
                                }}
                                disabled={isLoading || patients.length === 0}
                            >
                                <SelectTrigger
                                    id="patient-select"
                                    className="w-full bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    aria-label="Select a patient"
                                >
                                    <SelectValue placeholder={patients.length === 0 ? 'No patients available' : 'Select a patient'} />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {patients.map((patient) => (
                                        <SelectItem key={patient._id} value={patient._id} className="flex items-center gap-3 py-2">
                                            <span className="font-medium text-gray-800">{patient.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected Patient Details */}
                        {selectedUser && (
                            <div className="flex items-center justify-between gap-4">
                                <Image
                                    src={selectedUser.avatar || '/placeholder-avatar.png'}
                                    width={64}
                                    height={64}
                                    alt={selectedUser.name}
                                    className="rounded-full bg-secondary object-cover"
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800">{selectedUser.name}</span>
                                    <span className="text-sm text-gray-600">{selectedUser.email}</span>
                                    <span className="text-sm text-gray-600">{selectedUser.age}</span>
                                </div>
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading analytics...</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* No Patient Selected */}
            {!selectedUser && !error && (
                <Card className="shadow-lg">
                    <CardContent className="pt-6 text-center">
                        <p className="text-gray-600">Please select a patient to view their analytics.</p>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Display */}
            {analytics && selectedUser && (
                <PatientAnalytics patientId={selectedUser._id} data={analytics} />
            )}
        </div>
    );
};

export default AnalyticsHolder;