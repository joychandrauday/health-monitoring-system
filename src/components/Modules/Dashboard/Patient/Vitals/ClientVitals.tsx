/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaHeartbeat, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useSocket from '@/hooks/useSocket';
import TablePagination from '@/components/utils/TablePagination';
import { IDoctor, Vital, IMedicalNotification, User } from '@/types';
import { Meta } from '../../Admin/Doctor/DoctorTable';
import Image from 'next/image';
import VitalsForm from './VitalForms';
import { GetVitalsByUserId } from '@/service/VitalService';

interface VitalAlert {
    patientId: string;
    vitalId: string;
    message: string;
    vital: Vital;
}

interface AcknowledgmentNotification {
    patientId: string;
    notificationId: string;
    message: string;
    notification: IMedicalNotification;
}

interface ClientVitalsProps {
    initialVitalsHistory: Vital[];
    allDoctors: IDoctor[];
    userId: string;
    accessToken: string;
    vitalsMeta: Meta;
}

const ClientVitals = ({
    initialVitalsHistory,
    allDoctors,
    userId,
    accessToken,
    vitalsMeta,
}: ClientVitalsProps) => {
    const { socket, isConnected } = useSocket();
    const searchParams = useSearchParams();
    const [vitalsHistory, setVitalsHistory] = useState<Vital[]>(initialVitalsHistory);
    const [notifications, setNotifications] = useState<IMedicalNotification[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [doctorSearch, setDoctorSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchVitals = async () => {
            setIsLoading(true);
            try {
                const response = await GetVitalsByUserId({
                    userId,
                    token: accessToken,
                    page: currentPage,
                });
                console.log('Fetched vitals:', response.vitals);
                setVitalsHistory(response.vitals || []);
            } catch (error: any) {
                console.error('Error fetching vitals:', error.message);
                toast.error(error.message || 'Failed to load vitals');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVitals();
    }, [currentPage, userId, accessToken]);

    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('Socket not ready:', { socket: !!socket, isConnected });
            return;
        }

        const handleVitalAlert = (data: VitalAlert) => {
            console.log('Received vital:alert:', data);
            if (data.patientId === userId) {
                const notification: IMedicalNotification = {
                    _id: data.vitalId,
                    sender: userId,
                    receiver: selectedDoctorId || data.vital.doctorId || '',
                    type: 'vital',
                    message: data.message,
                    url: `/patient/vitals/${data.vitalId}`,
                    timestamp: data.vital.timestamp ? new Date(data.vital.timestamp) : new Date(),
                    acknowledged: false,
                };
                setNotifications((prev) => [notification, ...prev].slice(0, 20));
                toast.error(data.message, {
                    duration: 5000,
                    icon: <FaHeartbeat className="text-red-500" />,
                    style: {
                        background: 'rgb(245, 247, 250)',
                        color: 'rgb(55, 71, 79)',
                        border: '1px solid rgb(211, 47, 47)',
                    },
                });
            }
        };

        const handleVitalSubmitted = (data: Vital) => {
            console.log('Received vital:submitted:', data);
            if (data.patientId === userId) {
                setVitalsHistory((prev) => [data, ...prev].slice(0, 50));
                setShowForm(false);
                setSelectedDoctorId(null);
                toast.success('Vitals submitted successfully', {
                    duration: 4000,
                    style: {
                        background: 'rgb(245, 247, 250)',
                        color: 'rgb(55, 71, 79)',
                        border: '1px solid rgb(46, 125, 50)',
                    },
                });
            }
        };

        const handleNotificationAcknowledged = (data: AcknowledgmentNotification) => {
            console.log('Received notification:acknowledged:', data);
            if (data.patientId === userId && data.notification.receiver === userId) {
                setNotifications((prev) => [data.notification, ...prev].slice(0, 20));
                toast.success(data.message, {
                    duration: 5000,
                    icon: <FaCheckCircle className="text-green-500" />,
                    style: {
                        background: 'rgb(245, 247, 250)',
                        color: 'rgb(55, 71, 79)',
                        border: '1px solid rgb(46, 125, 50)',
                    },
                });
            }
        };

        socket.on('vital:alert', handleVitalAlert);
        socket.on('vital:submitted', handleVitalSubmitted);
        socket.on('notification:acknowledged', handleNotificationAcknowledged);

        return () => {
            socket.off('vital:alert', handleVitalAlert);
            socket.off('vital:submitted', handleVitalSubmitted);
            socket.off('notification:acknowledged', handleNotificationAcknowledged);
        };
    }, [socket, isConnected, userId, selectedDoctorId]);

    const handleDoctorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDoctorId(e.target.value);
    };

    const handleDoctorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDoctorSearch(e.target.value);
    };

    const filteredDoctors = allDoctors.filter((doctor) =>
        typeof doctor.user === "object" &&
        "name" in doctor.user &&
        doctor.user.name.toLowerCase().includes(doctorSearch.toLowerCase())
    );


    const handleModalSubmit = () => {
        if (selectedDoctorId) {
            setShowForm(true);
            setIsModalOpen(false);
            setDoctorSearch('');
        } else {
            toast.error('Please select a doctor', {
                style: {
                    background: 'rgb(245, 247, 250)',
                    color: 'rgb(55, 71, 79)',
                    border: '1px solid rgb(211, 47, 47)',
                },
            });
        }
    };

    const handleFormSubmitSuccess = (vital: Vital) => {
        setVitalsHistory((prev) => [vital, ...prev].slice(0, 50));
        setShowForm(false);
        setSelectedDoctorId(null);
        if (socket && isConnected) {
            socket.emit('vital:submit', {
                patientId: userId,
                doctorId: selectedDoctorId,
                vital,
            });
        }
    };
    function isUser(user: unknown): user is User {
        return typeof user === "object" && user !== null && "name" in user && "_id" in user;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {!isConnected && (
                    <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-md">
                        Real-time notifications are offline. Updates may be delayed.
                    </div>
                )}
                <h1 className="text-2xl font-bold text-blue-600 flex items-center mb-6">
                    <FaHeartbeat className="mr-2" /> Vitals
                </h1>
                {!showForm && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                        aria-label="Submit new vitals"
                    >
                        Submit Vitals
                    </button>
                )}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="doctor-selection-title"
                    >
                        <div
                            className="bg-white rounded-lg p-6 w-full max-w-md focus:outline-none"
                            tabIndex={-1}
                            aria-describedby="doctor-selection-desc"
                        >
                            <h2 id="doctor-selection-title" className="text-xl font-semibold text-gray-800 mb-4">
                                Select a Doctor
                            </h2>
                            <p id="doctor-selection-desc" className="sr-only">
                                Choose a doctor to submit your vitals to.
                            </p>
                            <input
                                type="text"
                                value={doctorSearch}
                                onChange={handleDoctorSearch}
                                placeholder="Search doctors..."
                                className="w-full p-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 mb-4"
                                aria-label="Search doctors"
                            />
                            <select
                                value={selectedDoctorId || ''}
                                onChange={handleDoctorSelect}
                                className="w-full p-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 mb-4"
                                aria-label="Select a doctor"
                            >
                                <option value="">Select a doctor</option>
                                {filteredDoctors.map((doctor) =>
                                    isUser(doctor.user) ? (
                                        <option key={doctor.user._id} value={doctor.user._id}>
                                            {doctor.user.name}
                                        </option>
                                    ) : null
                                )}
                            </select>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setDoctorSearch('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
                                    aria-label="Cancel doctor selection"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                    aria-label="Confirm doctor selection"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showForm && socket && (
                    <VitalsForm
                        userId={userId}
                        accessToken={accessToken}
                        selectedDoctorId={selectedDoctorId}
                        socket={socket}
                        onSubmitSuccess={handleFormSubmitSuccess}
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedDoctorId(null);
                        }}
                    />
                )}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
                    {notifications.length === 0 ? (
                        <p className="text-gray-500">No notifications received yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {notifications.map((notification) => (
                                <li
                                    key={notification._id}
                                    className={`p-3 rounded-md shadow flex items-start ${notification.type === 'vital'
                                        ? 'bg-red-50'
                                        : notification.type === 'acknowledgment'
                                            ? 'bg-green-50'
                                            : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{notification.message}</p>
                                        <p className="text-sm text-gray-600">
                                            Type: {notification.type} | Time:{' '}
                                            {new Date(notification.timestamp).toLocaleString('en-US', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                        {notification.url && (
                                            <p className="text-sm">
                                                <a href={notification.url} className="text-blue-600 underline hover:text-blue-800">
                                                    View Details
                                                </a>
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            Status: {notification.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Vitals History</h2>
                    {isLoading ? (
                        <p className="text-gray-500">Loading vitals...</p>
                    ) : vitalsHistory.length === 0 ? (
                        <p className="text-gray-500">No vitals recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="p-2 text-gray-700">Date</th>
                                        <th className="p-2 text-gray-700">Heart Rate</th>
                                        <th className="p-2 text-gray-700">Blood Pressure</th>
                                        <th className="p-2 text-gray-700">Glucose</th>
                                        <th className="p-2 text-gray-700">O2 Sat</th>
                                        <th className="p-2 text-gray-700">Temp</th>
                                        <th className="p-2 text-gray-700">Resp Rate</th>
                                        <th className="p-2 text-gray-700">Pain</th>
                                        <th className="p-2 text-gray-700">Injury</th>
                                        <th className="p-2 text-gray-700">Visuals</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vitalsHistory
                                        .filter((vital): vital is Vital & { _id: string } => !!vital && !!vital._id)
                                        .map((vital) => (
                                            <tr key={vital._id} className="border-b border-gray-200 hover:bg-blue-50">
                                                <td className="p-2">
                                                    {vital.timestamp
                                                        ? new Date(vital.timestamp).toLocaleString('en-US', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })
                                                        : 'Not available'}
                                                </td>
                                                <td className="p-2">{vital.heartRate ? `${vital.heartRate} bpm` : '-'}</td>
                                                <td className="p-2">
                                                    {vital.bloodPressure
                                                        ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
                                                        : '-'}
                                                </td>
                                                <td className="p-2">{vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : '-'}</td>
                                                <td className="p-2">{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}</td>
                                                <td className="p-2">{vital.temperature ? `${vital.temperature}°C` : '-'}</td>
                                                <td className="p-2">{vital.respiratoryRate ? `${vital.respiratoryRate}/min` : '-'}</td>
                                                <td className="p-2">{vital.painLevel ? `${vital.painLevel}/10` : '-'}</td>
                                                <td className="p-2">
                                                    {vital.injury && vital.injury.type !== 'none'
                                                        ? `${vital.injury.type} (${vital.injury.severity || 'N/A'}) ${vital.injury.description || ''}`
                                                        : '-'}
                                                </td>
                                                <td className="p-2">
                                                    {vital.visuals && vital.visuals.length > 0 ? (
                                                        <div className="flex gap-1">
                                                            {vital.visuals.map((visual, index) => (
                                                                <Image
                                                                    key={index}
                                                                    src={visual}
                                                                    alt={`Visual ${index + 1}`}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-10 h-10 object-cover rounded"
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        '-'
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
            </div>
        </div>
    );
};

export default ClientVitals;