'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChatPopup } from '../utils/ChatPopup';
import { getUniqueSenders } from '@/service/Chat';
import { useSession } from 'next-auth/react';

// Define Sender type to match getUniqueSenders response
interface Sender {
    _id: string;
    name: string;
    avatar?: string;
}

interface DoctorAccountProps {
    doctorId: string;
    doctorName: string;
    className?: string;
}

export const ChatHolderDoc: React.FC<DoctorAccountProps> = ({
    doctorId,
    doctorName,
    className = '',
}) => {
    const [patients, setPatients] = useState<Sender[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Sender | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Fixed limit of 10
    const [totalPages, setTotalPages] = useState(1);
    const [totalSenders, setTotalSenders] = useState(0);
    const { data: session } = useSession()

    // Fetch unique senders (patients)
    useEffect(() => {
        if (!doctorId) return;
        const getPatients = async () => {
            try {
                const token = session?.user?.accessToken
                const { senders, meta } = await getUniqueSenders(doctorId, token as string, page, limit);
                const mappedPatients: Sender[] = senders.map((sender) => ({
                    _id: sender.userId as string,
                    name: sender.name,
                    avatar: sender.avatar,
                }));
                setPatients(mappedPatients);
                setTotalPages(meta.totalPages);
                setTotalSenders(meta.total);
            } catch (error) {
                console.error('Failed to fetch patients:', error);
                setPatients([]);
                setTotalPages(1);
                setTotalSenders(0);
            }
        };

        getPatients();
    }, [doctorId, page, limit, session?.user?.accessToken]);

    const handleAvatarClick = (patient: Sender) => {
        setSelectedPatient(patient);
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setSelectedPatient(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className={`p-4 max-w-4xl mx-auto ${className}`}>
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-lg">
                    <CardTitle>
                        <h2 className="text-2xl font-bold">{`${doctorName}'s Dashboard`}</h2>
                        <p className="text-sm">Manage your patient communications</p>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Patients</h3>
                    {patients.length === 0 ? (
                        <p className="text-gray-500 text-center">No patients found</p>
                    ) : (
                        <>
                            <ScrollArea className="h-96 bg-gray-100 rounded-md">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                    {patients.map((patient) => (
                                        <div
                                            key={patient._id}
                                            className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleAvatarClick(patient)}
                                        >
                                            <Avatar className="h-16 w-16 mb-2">
                                                <AvatarImage src={patient.avatar} alt={patient.name} />
                                                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-medium text-center truncate w-full">{patient.name}</p>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="vertical" />
                            </ScrollArea>
                            {totalSenders > 10 && (
                                <div className="flex justify-center items-center mt-4 space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Chat Dialog */}
            {selectedPatient && (
                <ChatPopup
                    userId={doctorId}
                    selectedUserId={selectedPatient._id}
                    selectedUserName={selectedPatient.name}
                    isOpen={isChatOpen}
                    onClose={handleCloseChat}
                    className="z-50"
                />
            )}
        </div>
    );
};