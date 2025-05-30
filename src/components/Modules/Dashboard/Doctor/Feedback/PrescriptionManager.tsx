'use client';
import React, { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddMedicine, DeleteMedicine, UpdateMedicine } from '@/service/feedback';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Medication {
    medication: string;
    brandName?: string;
    dosage: string;
    duration: string;
    instructions?: string;
}

interface PrescriptionManagerProps {
    initialPrescriptions: Medication[];
    vitalId: string;
}

const PrescriptionManager = ({ initialPrescriptions, vitalId }: PrescriptionManagerProps) => {
    const { data: session } = useSession();
    const [prescriptions, setPrescriptions] = useState<Medication[]>(initialPrescriptions);
    const [medicationForm, setMedicationForm] = useState<Medication>({
        medication: '',
        brandName: '',
        dosage: '',
        duration: '',
        instructions: '',
    });
    const [isPrescriptionCardOpen, setIsPrescriptionCardOpen] = useState(false);
    const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [medTitle, setMedTitle] = useState('');
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const handleMedicationChange = (field: keyof Medication, value: string) => {
        setMedicationForm({ ...medicationForm, [field]: value });
    };

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicationForm.medication.trim() || !medicationForm.dosage.trim() || !medicationForm.duration.trim()) {
            alert('Please fill all required fields (Medication, Dosage, Duration).');
            return;
        }

        if (editingMedicationIndex !== null) {
            const updatedPrescriptions = [...prescriptions];
            updatedPrescriptions[editingMedicationIndex] = { ...medicationForm };
            setPrescriptions(updatedPrescriptions);
            await UpdateMedicine(vitalId, medicationForm, session?.user?.accessToken as string)
            toast.success('medication updated successfully!')
            setEditingMedicationIndex(null);
        } else {
            setPrescriptions([...prescriptions, { ...medicationForm }]);
            await AddMedicine(vitalId, medicationForm, session?.user?.accessToken as string)
            toast.success('medication added successfully!')
        }

        setMedicationForm({
            medication: '',
            brandName: '',
            dosage: '',
            duration: '',
            instructions: '',
        });
        setIsPrescriptionCardOpen(false);
    };

    const handleEditMedication = (index: number) => {
        setMedicationForm(prescriptions[index]);
        setEditingMedicationIndex(index);
        setIsPrescriptionCardOpen(true);
    };

    const handleDelete = (index: number, med: Medication) => {
        setDeleteIndex(index);
        setIsDeleteConfirmOpen(true);
        setMedTitle(med.medication)
    };

    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            const updatedPrescriptions = prescriptions.filter((_, i) => i !== deleteIndex);
            setPrescriptions(updatedPrescriptions);
            await DeleteMedicine(vitalId, medTitle, session?.user?.accessToken as string)
            toast.success(`Medication Deleted:, ${prescriptions[deleteIndex].medication}`);
        }
        setIsDeleteConfirmOpen(false);
        setDeleteIndex(null);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prescriptions</h2>
            {prescriptions.length > 0 ? (
                <div className="w-full lg:max-w-4xl overflow-x-auto">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {prescriptions.map((med, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{med.medication}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.brandName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.duration}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{med.instructions || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEditMedication(index)}
                                            className="text-indigo-600 hover:text-indigo-800 mr-4"
                                            aria-label={`Edit medication ${index + 1} `}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index, med)}
                                            className="text-red-600 hover:text-red-800"
                                            aria-label={`Delete medication ${index + 1} `}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">No medications added</p>
            )}
            <button
                onClick={() => {
                    setMedicationForm({
                        medication: '',
                        brandName: '',
                        dosage: '',
                        duration: '',
                        instructions: '',
                    });
                    setEditingMedicationIndex(null);
                    setIsPrescriptionCardOpen(true);
                }}
                className="mt-4 bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
            >
                <Plus size={16} className="inline-block mr-2" />
                Add Medication
            </button>

            <Dialog open={isPrescriptionCardOpen} onOpenChange={setIsPrescriptionCardOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingMedicationIndex !== null ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Medication</label>
                                <input
                                    type="text"
                                    value={medicationForm.medication}
                                    onChange={(e) => handleMedicationChange('medication', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                    required
                                    readOnly={editingMedicationIndex !== null}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Brand Name (Optional)</label>
                                <input
                                    type="text"
                                    value={medicationForm.brandName || ''}
                                    onChange={(e) => handleMedicationChange('brandName', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Dosage</label>
                                <input
                                    type="text"
                                    value={medicationForm.dosage}
                                    onChange={(e) => handleMedicationChange('dosage', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Duration</label>
                                <input
                                    type="text"
                                    value={medicationForm.duration}
                                    onChange={(e) => handleMedicationChange('duration', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Instructions (Optional)</label>
                                <textarea
                                    value={medicationForm.instructions || ''}
                                    onChange={(e) => handleMedicationChange('instructions', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            {editingMedicationIndex !== null ? 'Update Medication' : 'Add Medication'}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this medication?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PrescriptionManager;