'use client';
import React, { useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddLabTest, DeleteLabTest, Labtest, UpdateLabTest } from '@/service/feedback';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface LabTest {
    testName: string;
    urgency: 'routine' | 'urgent';
    notes?: string;
    scheduledDate?: string;
    labLocation?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    resultLink?: string;
    physicianNote?: string;
}

interface LabTestManagerProps {
    initialLabTests: LabTest[];
    vitalId: string;
}

const LabTestManager = ({ initialLabTests, vitalId }: LabTestManagerProps) => {
    const { data: session } = useSession()
    const [labTests, setLabTests] = useState<LabTest[]>(initialLabTests);
    const [labTestForm, setLabTestForm] = useState<LabTest>({
        testName: '',
        urgency: 'routine',
        notes: '',
        scheduledDate: '',
        labLocation: '',
        status: 'pending',
        resultLink: '',
        physicianNote: '',
    });
    const [isLabTestCardOpen, setIsLabTestCardOpen] = useState(false);
    const [testName, setTestName] = useState('');
    const [editingLabTestIndex, setEditingLabTestIndex] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const handleLabTestChange = (field: keyof LabTest, value: string) => {
        setLabTestForm({ ...labTestForm, [field]: value });
    };

    const handleLabTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!labTestForm.testName.trim()) {
            alert('Test Name is required.');
            return;
        }
        if (labTestForm.scheduledDate && !/^\d{4}-\d{2}-\d{2}$/.test(labTestForm.scheduledDate)) {
            alert('Scheduled Date must be in YYYY-MM-DD format.');
            return;
        }

        const newLabTest: LabTest = {
            testName: labTestForm.testName,
            urgency: labTestForm.urgency,
            notes: labTestForm.notes || undefined,
            scheduledDate: labTestForm.scheduledDate || undefined,
            labLocation: labTestForm.labLocation || undefined,
            status: labTestForm.status || undefined,
            resultLink: labTestForm.resultLink || undefined,
            physicianNote: labTestForm.physicianNote || undefined,
        };

        if (editingLabTestIndex !== null) {
            const updatedLabTests = [...labTests];
            updatedLabTests[editingLabTestIndex] = newLabTest;
            setLabTests(updatedLabTests);
            await UpdateLabTest(vitalId, newLabTest, session?.user?.accessToken as string)
            setEditingLabTestIndex(null);
        } else {
            setLabTests([...labTests, newLabTest]);
            await AddLabTest(vitalId, newLabTest, session?.user?.accessToken as string)
            toast.success('Lab Test Added!!');
        }

        setLabTestForm({
            testName: '',
            urgency: 'routine',
            notes: '',
            scheduledDate: '',
            labLocation: '',
            status: 'pending',
            resultLink: '',
            physicianNote: '',
        });
        setIsLabTestCardOpen(false);
    };

    const handleEditLabTest = (index: number) => {
        setLabTestForm({
            testName: labTests[index].testName,
            urgency: labTests[index].urgency,
            notes: labTests[index].notes || '',
            scheduledDate: labTests[index].scheduledDate || '',
            labLocation: labTests[index].labLocation || '',
            status: labTests[index].status || 'pending',
            resultLink: labTests[index].resultLink || '',
            physicianNote: labTests[index].physicianNote || '',
        });
        setEditingLabTestIndex(index);
        setIsLabTestCardOpen(true);
    };

    const handleDelete = (index: number, test: Labtest) => {
        setDeleteIndex(index);
        setIsDeleteConfirmOpen(true);
        setTestName(test.testName)
    };

    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            const updatedLabTests = labTests.filter((_, i) => i !== deleteIndex);
            setLabTests(updatedLabTests);
            await DeleteLabTest(vitalId, testName, session?.user?.accessToken as string)
            toast.success('Lab Test Deleted successfully!!');
        }
        setIsDeleteConfirmOpen(false);
        setDeleteIndex(null);
    };

    return (
        <div className="p-4 overflow-x-hidden">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lab Tests</h2>
            {labTests.length > 0 ? (
                <div className="w-full md:max-w-4xl overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Test Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Urgency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Scheduled Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Lab Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Result Link</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physician Note</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {labTests.map((test, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{test.testName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{test.urgency}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{test.scheduledDate || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{test.labLocation || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{test.status || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {test.resultLink ? (
                                            <a href={test.resultLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                                View Result
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{test.notes || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{test.physicianNote || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                        <button
                                            onClick={() => handleEditLabTest(index)}
                                            className="text-indigo-600 hover:text-indigo-800 mr-4"
                                            aria-label={`Edit lab test ${index + 1}`}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index, test)}
                                            className="text-red-600 hover:text-red-800"
                                            aria-label={`Delete lab test ${index + 1}`}
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
                <p className="text-gray-500">No lab tests</p>
            )}
            <button
                onClick={() => {
                    setLabTestForm({
                        testName: '',
                        urgency: 'routine',
                        notes: '',
                        scheduledDate: '',
                        labLocation: '',
                        status: 'pending',
                        resultLink: '',
                        physicianNote: '',
                    });
                    setEditingLabTestIndex(null);
                    setIsLabTestCardOpen(true);
                }}
                className="mt-4 bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
            >
                <Plus size={16} className="inline-block mr-2" />
                Add Lab Test
            </button>

            <Dialog open={isLabTestCardOpen} onOpenChange={setIsLabTestCardOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingLabTestIndex !== null ? 'Edit Lab Test' : 'Add Lab Test'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLabTestSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Test Name</label>
                                <input
                                    type="text"
                                    value={labTestForm.testName}
                                    onChange={(e) => handleLabTestChange('testName', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                    readOnly={editingLabTestIndex !== null}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Urgency</label>
                                <select
                                    value={labTestForm.urgency}
                                    onChange={(e) => handleLabTestChange('urgency', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="routine">Routine</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Scheduled Date (Optional)</label>
                                <input
                                    type="date"
                                    value={labTestForm.scheduledDate || ''}
                                    onChange={(e) => handleLabTestChange('scheduledDate', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Lab Location (Optional)</label>
                                <input
                                    type="text"
                                    value={labTestForm.labLocation || ''}
                                    onChange={(e) => handleLabTestChange('labLocation', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Status (Optional)</label>
                                <select
                                    value={labTestForm.status || 'pending'}
                                    onChange={(e) => handleLabTestChange('status', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Result Link (Optional)</label>
                                <input
                                    type="url"
                                    value={labTestForm.resultLink || ''}
                                    onChange={(e) => handleLabTestChange('resultLink', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Notes (Optional)</label>
                                <textarea
                                    value={labTestForm.notes || ''}
                                    onChange={(e) => handleLabTestChange('notes', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium">Physician Note (Optional)</label>
                                <textarea
                                    value={labTestForm.physicianNote || ''}
                                    onChange={(e) => handleLabTestChange('physicianNote', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {editingLabTestIndex !== null ? 'Update Lab Test' : 'Add Lab Test'}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this lab test?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LabTestManager;