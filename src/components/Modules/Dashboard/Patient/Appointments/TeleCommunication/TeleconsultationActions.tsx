'use client';

import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/utils/ChatPopup";
import { MessageSquare, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { IAppointment } from "@/types";

export const TeleconsultationActions: React.FC<{ appointment: IAppointment }> = ({ appointment }) => {
    const { data: session } = useSession();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleJoinCall = () => {
        alert('Joining video call... (Placeholder for video call integration)');
    };

    const handleOpenChat = () => {
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
    };

    // 🧠 Determine doctorId and name safely
    const doctorId = typeof appointment.doctorId === 'string'
        ? appointment.doctorId
        : appointment.doctorId._id;

    const doctorName = typeof appointment.doctorId === 'string'
        ? 'Doctor'
        : appointment.doctorId.name || 'Doctor';

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
                    Chat
                </Button>
            </div>

            {isChatOpen && (
                <ChatPopup
                    userId={session?.user?.id as string}
                    doctorId={doctorId}
                    doctorName={doctorName}
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    className="z-50"
                />
            )}
        </div>
    );
};
