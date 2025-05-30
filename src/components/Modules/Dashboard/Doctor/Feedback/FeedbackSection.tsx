'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PrescriptionManager from './PrescriptionManager';
import LabTestManager from './LabTestManager';
import { addRecommendationOnVital } from '@/service/feedback';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface FeedbackSectionProps {
    initialPrescriptions: {
        medication: string;
        dosage: string;
        duration: string;
        instructions?: string;
    }[];
    initialLabTests: {
        testName: string;
        urgency: 'routine' | 'urgent';
        notes?: string;
    }[];
    initialRecommendations: string;
    vitalId: string;
}

const FeedbackSection = ({ initialPrescriptions, initialLabTests, initialRecommendations, vitalId }: FeedbackSectionProps) => {
    const { data: session } = useSession()
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [recommendations, setRecommendations] = useState(initialRecommendations);

    const toggleFeedback = () => {
        setIsFeedbackOpen(!isFeedbackOpen);
    };

    const handleRecommendationsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addRecommendationOnVital(vitalId, recommendations, session?.user?.accessToken as string)
        toast.success('Recommedation added!!')
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow mt-2 border">
            <button
                onClick={toggleFeedback}
                className="flex items-center justify-between w-full text-lg font-semibold text-gray-800"
            >
                Feedback
                {isFeedbackOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isFeedbackOpen && (
                <div className="mt-4 space-y-4">
                    <PrescriptionManager initialPrescriptions={initialPrescriptions} vitalId={vitalId} />
                    < LabTestManager initialLabTests={initialLabTests} vitalId={vitalId} />
                    < div >
                        <p className="text-gray-700 font-semibold">Recommendations:</p>
                        <form onSubmit={handleRecommendationsSubmit} className="mt-2">
                            <textarea
                                value={recommendations}
                                onChange={(e) => setRecommendations(e.target.value)}
                                placeholder="Enter recommendations..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="mt-4 bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
                            >
                                Update Recommendations
                            </button>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default FeedbackSection;