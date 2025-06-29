'use client';

import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/utils/ChatPopup";
import { MessageSquare, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { IAppointment } from "@/types";
import { useVideoChat } from "@/hooks/useVideoChat";
import { useVideoCallContext } from "@/lib/VideoCallContext";
import { Types } from 'mongoose';

export const TeleconsultationActions: React.FC<{ appointment: IAppointment }> = ({ appointment }) => {
    const { data: session } = useSession();
    const { isConnected, callRinging, incomingCall, isOnline } = useVideoCallContext();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isOnlineUser, setIsOnlineUser] = useState(false);
    const {
        isCallActive,
        startVideoCall,
        error,
    } = useVideoChat();

    useEffect(() => {
        if (isConnected && session?.user?.id && Types.ObjectId.isValid(session.user.id)) {
            const online = isOnline(session.user.id);
            console.log('Checking isOnlineUser for user:', session.user.id, 'Result:', online);
            setIsOnlineUser(online);
        } else {
            console.warn('Cannot check isOnlineUser:', {
                isConnected,
                hasUserId: !!session?.user?.id,
                userIdValid: session?.user?.id ? Types.ObjectId.isValid(session.user.id) : false,
            });
            setIsOnlineUser(false);
        }
    }, [isConnected, session?.user?.id, isOnline]);

    useEffect(() => {
        console.log('TeleconsultationActions state:', { callRinging, incomingCall });
    }, [callRinging, incomingCall]);

    const handleOpenChat = () => {
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
    };

    const patientId =
        typeof appointment.patientId === 'string' ? appointment.patientId : appointment.patientId._id;
    const patientName =
        typeof appointment.patientId === 'string' ? 'Patient' : appointment.patientId.name || 'Patient';
    const doctorId =
        typeof appointment.doctorId === 'string' ? appointment.doctorId : appointment.doctorId._id;
    const doctorName =
        typeof appointment.doctorId === 'string' ? 'Doctor' : appointment.doctorId.name || 'Doctor';

    const isDoctorOnline = Types.ObjectId.isValid(doctorId) ? isOnline(doctorId) : false;
    console.log('Checking isDoctorOnline for doctor:', doctorId, 'Result:', isDoctorOnline);

    if (!Types.ObjectId.isValid(patientId) || !Types.ObjectId.isValid(doctorId)) {
        console.error('Invalid appointment IDs:', { patientId, doctorId });
        return <div className="text-red-500">Invalid appointment data</div>;
    }

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Teleconsultation Actions</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-lg font-semibold text-gray-900 truncate">
                    {session?.user?.role === 'patient' ? doctorName : patientName}
                </span>
                {session?.user?.role === 'patient' ? (
                    <>
                        <span
                            className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isDoctorOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={isDoctorOnline ? 'Online' : 'Offline'}
                        ></span>
                        <span className={`text-sm font-medium ${isDoctorOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {isDoctorOnline ? 'Online' : 'Offline'}
                        </span>
                    </>
                ) : (
                    <>
                        <span
                            className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isOnlineUser ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={isOnlineUser ? 'Online' : 'Offline'}
                        ></span>
                        <span className={`text-sm font-medium ${isOnlineUser ? 'text-green-600' : 'text-gray-500'}`}>
                            {isOnlineUser ? 'Online' : 'Offline'}
                        </span>
                    </>
                )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    variant="default"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => startVideoCall(appointment)}
                    disabled={isCallActive}
                >
                    <Video className="mr-2 h-6 w-4" />
                    Join Call
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

            {isChatOpen && session?.user?.id && Types.ObjectId.isValid(session.user.id) && (
                <ChatPopup
                    userId={session.user.id}
                    selectedUserId={patientId}
                    selectedUserName={patientName}
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    className="z-50"
                />
            )}
        </div>
    );
};