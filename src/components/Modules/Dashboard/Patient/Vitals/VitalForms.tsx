/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { Vital } from '@/types';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { PostVitals } from '@/service/VitalService';
import { Socket } from 'socket.io-client';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

interface FormData {
    heartRate: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    glucoseLevel: string;
    oxygenSaturation: string;
    temperature: string;
    respiratoryRate: string;
    painLevel: string;
    injuryType: string;
    injuryDescription: string;
    injurySeverity: string;
    visuals: string[]; // URLs from Cloudinary
}

export interface VitalsFormProps {
    userId: string;
    accessToken: string;
    selectedDoctorId: string | null;
    socket: Socket;
    onSubmitSuccess: (vital: Vital) => void;
    onCancel: () => void;
}

const VitalsForm = ({ userId, selectedDoctorId, socket, onSubmitSuccess, onCancel }: VitalsFormProps) => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState<FormData>({
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        glucoseLevel: '',
        oxygenSaturation: '',
        temperature: '',
        respiratoryRate: '',
        painLevel: '',
        injuryType: 'none',
        injuryDescription: '',
        injurySeverity: '',
        visuals: [],
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // Use Cloudinary upload hook
    const { uploadImage, isUploading, error: uploadError } = useCloudinaryUpload();

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Handle file input for visuals
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setLoading(true);
            try {
                const uploadPromises = Array.from(files).map(async (file) => {
                    const url = await uploadImage(file); // Use Cloudinary upload
                    return url;
                });
                const uploadedUrls = await Promise.all(uploadPromises);
                setFormData((prev) => ({
                    ...prev,
                    visuals: [...prev.visuals, ...uploadedUrls],
                }));
                toast.success('Images uploaded successfully!');
            } catch (err) {
                toast.error(`Failed to upload images: ${uploadError || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        }
    };

    // Remove a visual image
    const handleRemoveVisual = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            visuals: prev.visuals.filter((_, i) => i !== index),
        }));
    };

    // Reset form fields
    const handleResetForm = () => {
        setFormData({
            heartRate: '',
            bloodPressureSystolic: '',
            bloodPressureDiastolic: '',
            glucoseLevel: '',
            oxygenSaturation: '',
            temperature: '',
            respiratoryRate: '',
            painLevel: '',
            injuryType: 'none',
            injuryDescription: '',
            injurySeverity: '',
            visuals: [],
        });
        setErrors({});
    };

    // Basic validation for entered values
    const validateInputs = () => {
        const newErrors: { [key: string]: string } = {};

        if (formData.heartRate && (isNaN(Number(formData.heartRate)) || Number(formData.heartRate) < 0 || Number(formData.heartRate) > 200)) {
            newErrors.heartRate = 'Heart rate must be between 0 and 200 bpm';
        }
        if (
            formData.bloodPressureSystolic &&
            (isNaN(Number(formData.bloodPressureSystolic)) || Number(formData.bloodPressureSystolic) < 0 || Number(formData.bloodPressureSystolic) > 300)
        ) {
            newErrors.bloodPressureSystolic = 'Systolic BP must be between 0 and 300 mmHg';
        }
        if (
            formData.bloodPressureDiastolic &&
            (isNaN(Number(formData.bloodPressureDiastolic)) || Number(formData.bloodPressureDiastolic) < 0 || Number(formData.bloodPressureDiastolic) > 200)
        ) {
            newErrors.bloodPressureDiastolic = 'Diastolic BP must be between 0 and 200 mmHg';
        }
        if (formData.glucoseLevel && (isNaN(Number(formData.glucoseLevel)) || Number(formData.glucoseLevel) < 0 || Number(formData.glucoseLevel) > 500)) {
            newErrors.glucoseLevel = 'Glucose level must be between 0 and 500 mg/dL';
        }
        if (
            formData.oxygenSaturation &&
            (isNaN(Number(formData.oxygenSaturation)) || Number(formData.oxygenSaturation) < 0 || Number(formData.oxygenSaturation) > 100)
        ) {
            newErrors.oxygenSaturation = 'Oxygen saturation must be between 0 and 100%';
        }
        if (formData.temperature && (isNaN(Number(formData.temperature)) || Number(formData.temperature) < 0 || Number(formData.temperature) > 50)) {
            newErrors.temperature = 'Temperature must be between 0 and 50°C';
        }
        if (
            formData.respiratoryRate &&
            (isNaN(Number(formData.respiratoryRate)) || Number(formData.respiratoryRate) < 0 || Number(formData.respiratoryRate) > 100)
        ) {
            newErrors.respiratoryRate = 'Respiratory rate must be between 0 and 100 breaths/min';
        }
        if (formData.painLevel && (isNaN(Number(formData.painLevel)) || Number(formData.painLevel) < 0 || Number(formData.painLevel) > 10)) {
            newErrors.painLevel = 'Pain level must be between 0 and 10';
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            // Prepare API payload
            const payload: any = { patientId: userId };
            if (formData.heartRate) payload.heartRate = Number(formData.heartRate);
            if (formData.bloodPressureSystolic && formData.bloodPressureDiastolic) {
                payload.bloodPressure = {
                    systolic: Number(formData.bloodPressureSystolic),
                    diastolic: Number(formData.bloodPressureDiastolic),
                };
            }
            if (formData.glucoseLevel) payload.glucoseLevel = Number(formData.glucoseLevel);
            if (formData.oxygenSaturation) payload.oxygenSaturation = Number(formData.oxygenSaturation);
            if (formData.temperature) payload.temperature = Number(formData.temperature);
            if (formData.respiratoryRate) payload.respiratoryRate = Number(formData.respiratoryRate);
            if (formData.painLevel) payload.painLevel = Number(formData.painLevel);
            if (formData.injuryType !== 'none') {
                payload.injury = {
                    type: formData.injuryType,
                    description: formData.injuryDescription || undefined,
                    severity: formData.injurySeverity || undefined,
                };
            }
            if (formData.visuals.length > 0) payload.visuals = formData.visuals; // Now contains Cloudinary URLs
            if (selectedDoctorId) payload.doctorId = selectedDoctorId;

            // Submit vitals via API
            const responseData = await PostVitals({ data: payload, token: session?.user?.accessToken as string });
            // Emit Socket.io event
            socket?.emit('vital:submit', {
                patientId: userId,
                doctorId: selectedDoctorId,
                vital: responseData.data.vital,
            });

            // Trigger success callback
            onSubmitSuccess(responseData.data.vital);

            // Prepare success toast message
            const vitalDetails = [];
            if (payload?.heartRate) vitalDetails.push(`Heart Rate: ${payload?.heartRate} bpm`);
            if (payload?.bloodPressure) vitalDetails.push(`BP: ${payload?.bloodPressure.systolic}/${payload?.bloodPressure.diastolic} mmHg`);
            if (payload?.glucoseLevel) vitalDetails.push(`Glucose: ${payload?.glucoseLevel} mg/dL`);
            if (payload?.oxygenSaturation) vitalDetails.push(`O2 Sat: ${payload?.oxygenSaturation}%`);
            if (payload?.temperature) vitalDetails.push(`Temp: ${payload?.temperature}°C`);
            if (payload?.respiratoryRate) vitalDetails.push(`Resp Rate: ${payload?.respiratoryRate}/min`);
            if (payload?.painLevel) vitalDetails.push(`Pain: ${payload?.painLevel}/10`);
            if (payload?.injury?.type) vitalDetails.push(`Injury: ${payload?.injury.type}`);
            if (payload?.visuals?.length > 0) vitalDetails.push(`Images: ${payload?.visuals.length}`);

            toast.success(
                <div>
                    <strong>Vitals submitted successfully!</strong>
                    {vitalDetails.length > 0 ? (
                        <ul className="list-disc pl-4 mt-1">
                            {vitalDetails.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No vital details provided.</p>
                    )}
                </div>,
                {
                    duration: 6000,
                    style: {
                        background: '#F5F7FA',
                        color: '#37474F',
                        border: '1px solid #2E7D32',
                        maxWidth: '500px',
                    },
                }
            );
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(`Failed to submit vitals: ${error.message || 'Unknown error'}`, {
                style: { background: '#F5F7FA', color: '#37474F', border: '1px solid #D32F2F' },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium text-slate-gray mb-4">Submit Vitals</h2>
            {errors.form && <p className="text-vital-red text-sm mb-4">{errors.form}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Heart Rate (bpm)</label>
                    <input
                        type="number"
                        name="heartRate"
                        value={formData.heartRate}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.heartRate ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 80"
                    />
                    {errors.heartRate && <p className="text-vital-red text-sm mt-1">{errors.heartRate}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Blood Pressure (mmHg)</label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="number"
                                name="bloodPressureSystolic"
                                value={formData.bloodPressureSystolic}
                                onChange={handleInputChange}
                                className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.bloodPressureSystolic ? 'border-vital-red' : 'border-light-gray'}`}
                                placeholder="Systolic, e.g., 120"
                            />
                            {errors.bloodPressureSystolic && <p className="text-vital-red text-sm mt-1">{errors.bloodPressureSystolic}</p>}
                        </div>
                        <div className="flex-1">
                            <input
                                type="number"
                                name="bloodPressureDiastolic"
                                value={formData.bloodPressureDiastolic}
                                onChange={handleInputChange}
                                className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.bloodPressureDiastolic ? 'border-vital-red' : 'border-light-gray'}`}
                                placeholder="Diastolic, e.g., 80"
                            />
                            {errors.bloodPressureDiastolic && <p className="text-vital-red text-sm mt-1">{errors.bloodPressureDiastolic}</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Glucose Level (mg/dL)</label>
                    <input
                        type="number"
                        name="glucoseLevel"
                        value={formData.glucoseLevel}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.glucoseLevel ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 100"
                    />
                    {errors.glucoseLevel && <p className="text-vital-red text-sm mt-1">{errors.glucoseLevel}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Oxygen Saturation (%)</label>
                    <input
                        type="number"
                        name="oxygenSaturation"
                        value={formData.oxygenSaturation}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.oxygenSaturation ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 98"
                    />
                    {errors.oxygenSaturation && <p className="text-vital-red text-sm mt-1">{errors.oxygenSaturation}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Temperature (°C)</label>
                    <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.temperature ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 36.6"
                        step="0.1"
                    />
                    {errors.temperature && <p className="text-vital-red text-sm mt-1">{errors.temperature}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Respiratory Rate (breaths/min)</label>
                    <input
                        type="number"
                        name="respiratoryRate"
                        value={formData.respiratoryRate}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.respiratoryRate ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 16"
                    />
                    {errors.respiratoryRate && <p className="text-vital-red text-sm mt-1">{errors.respiratoryRate}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Pain Level (0-10)</label>
                    <input
                        type="number"
                        name="painLevel"
                        value={formData.painLevel}
                        onChange={handleInputChange}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-sky-blue ${errors.painLevel ? 'border-vital-red' : 'border-light-gray'}`}
                        placeholder="e.g., 3"
                    />
                    {errors.painLevel && <p className="text-vital-red text-sm mt-1">{errors.painLevel}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Injury Type</label>
                    <select
                        name="injuryType"
                        value={formData.injuryType}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border rounded-md focus:ring-sky-blue border-light-gray"
                    >
                        <option value="none">None</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                    </select>
                </div>
                {formData.injuryType !== 'none' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-gray">Injury Description</label>
                            <input
                                type="text"
                                name="injuryDescription"
                                value={formData.injuryDescription}
                                onChange={handleInputChange}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-sky-blue border-light-gray"
                                placeholder="e.g., Bruising on left arm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-gray">Injury Severity</label>
                            <select
                                name="injurySeverity"
                                value={formData.injurySeverity}
                                onChange={handleInputChange}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-sky-blue border-light-gray"
                            >
                                <option value="">Select severity</option>
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                            </select>
                        </div>
                    </>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-gray">Visuals (Images)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 w-full p-2 border rounded-md focus:ring-sky-blue border-light-gray"
                        disabled={isUploading} // Disable input during upload
                    />
                    {isUploading && (
                        <div className="flex items-center mt-2">
                            <FaSpinner className="animate-spin mr-2" />
                            <span>Uploading images...</span>
                        </div>
                    )}
                    {uploadError && <p className="text-vital-red text-sm mt-1">{uploadError}</p>}
                    {formData.visuals.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {formData.visuals.map((visual, index) => (
                                <div key={index} className="relative">
                                    <Image src={visual} alt={`Visual ${index + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVisual(index)}
                                        className="absolute top-0 right-0 bg-vital-red text-white rounded-full p-1 hover:bg-red-700"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border bg-light-gray text-slate-gray rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-300"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-yellow-500 text-soft-white rounded-md hover:bg-yellow-600 focus:ring-2"
                >
                    Reset Form
                </button>
                <button
                    type="submit"
                    disabled={loading || isUploading}
                    className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-sky-blue focus:ring-2 focus:ring-sky-blue flex items-center ${loading || isUploading ? 'cursor-not-allowed' : ''}`}
                >
                    {loading || isUploading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Vitals'
                    )}
                </button>
            </div>
        </form>
    );
};

export default VitalsForm;