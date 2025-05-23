'use client';

import { Button } from "@/components/ui/button";
import { MessageSquare, Video } from "lucide-react";

export const TeleconsultationActions: React.FC<{ appointmentId: string }> = ({ appointmentId }) => {
    const handleJoinCall = () => {
        alert('Joining video call... (Placeholder for video call integration)');
        console.log(appointmentId);
    };

    const handleOpenChat = () => {
        alert('Opening chat... (Placeholder for chat integration)');
        // Integrate with your chat service here
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Teleconsultation Actions</h3>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    variant="default"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleJoinCall}
                >
                    <Video className="mr-2 h-4 w-4" />
                    Join Video Call
                </Button>
                <Button
                    variant="outline"
                    className="hover:bg-gray-100"
                    onClick={handleOpenChat}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Chat
                </Button>
            </div>
        </div>
    );
};