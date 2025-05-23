'use client';
import { User } from '@/types';
import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Doctor } from '../../Admin/Doctor/DocRequestTable';
import logo from '../../../../../../public/telemiconwhite.png';

interface PresVital {
    _id: string;
    patientId: User | string;
    doctorId: Doctor | string;
    status: 'acknowledged' | 'pending' | 'in-progress' | 'completed';
    feedback?: {
        prescriptions?: {
            medication: string;
            brandName?: string;
            dosage: string;
            duration: string;
            instructions?: string;
        }[];
        labTests?: {
            testName: string;
            urgency: 'routine' | 'urgent';
            notes?: string;
            scheduledDate?: string;
            labLocation?: string;
            status?: 'pending' | 'completed' | 'cancelled';
            resultLink?: string;
            physicianNote?: string;
        }[];
        recommendations?: string;
    };
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    glucoseLevel?: number;
    oxygenSaturation?: number;
    temperature?: number;
    respiratoryRate?: number;
    painLevel?: number;
    injury?: {
        type: 'internal' | 'external' | 'none';
        description?: string;
        severity?: 'mild' | 'moderate' | 'severe';
    };
    visuals?: string[];
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    timestamp: Date;
    updatedAt: Date;
}

interface PrescriptionGeneratorProps {
    vital: PresVital;
}

interface PatientDetails {
    name: string;
    email: string;
    age: string;
    gender: string;
    bloodGroup: string;
    phone: string;
}

interface DoctorDetails {
    name: string;
    email: string;
    phone: string;
}

const PrescriptionGenerator: React.FC<PrescriptionGeneratorProps> = ({ vital }) => {
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const convertImageToBase64 = async () => {
            try {
                const response = await fetch(logo.src);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setLogoBase64(base64String);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error converting logo to base64:', error);
                setLogoBase64(null);
            }
        };

        convertImageToBase64();
    }, []);

    const patient: PatientDetails = (() => {
        if (typeof vital.patientId === 'string') {
            return {
                name: vital.patientId,
                email: '-',
                age: '-',
                gender: '-',
                bloodGroup: '-',
                phone: '-',
            };
        }
        const user = vital.patientId as User || {
            name: 'Unknown',
            email: '-',
            age: '-',
            gender: '-',
            bloodGroup: '-',
            phone: '-',
        };
        return {
            name: user.name || 'Unknown',
            email: user.email || '-',
            age: String(user.age || '-'),
            gender: user.gender || '-',
            bloodGroup: user.bloodGroup || '-',
            phone: user.phone || '-',
        };
    })();

    const doctor: DoctorDetails = (() => {
        if (typeof vital.doctorId === 'string') {
            return {
                name: vital.doctorId,
                email: '-',
                phone: '-',
            };
        }
        const doc = vital.doctorId as Doctor || {
            name: 'Unknown',
            email: '-',
            phone: '-',
        };
        return {
            name: doc.name || 'Unknown',
            email: doc.email || '-',
            phone: doc.phone || '-',
        };
    })();

    const generatePDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const primaryForeground = [255, 255, 255] as const;
            const secondaryColor = [46, 125, 50] as const;
            const lightGray = [240, 240, 240] as const;
            const borderColor = [200, 200, 200] as const;
            const textGray = [100, 100, 100] as const;
            const darkColor = [0, 0, 0] as const;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(22);

            doc.setFillColor(...primaryForeground);
            doc.rect(0, 0, 210, 297, 'F');

            doc.setFillColor(...secondaryColor);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(...primaryForeground);
            doc.setFont('helvetica', 'bold');
            doc.text(`Dr. ${doctor.name}`, 10, 15, { align: 'left' });
            doc.setFontSize(10);
            doc.text(`Phone: ${doctor.phone || '-'}`, 10, 20, { align: 'left' });
            doc.text(`Email: ${doctor.email || '-'}`, 10, 25, { align: 'left' });

            doc.setFontSize(14);
            doc.text('Remote Health', 180, 12, { align: 'right' });
            doc.text('Monitoring System', 180, 18, { align: 'right' });

            if (logoBase64) {
                const logoHeight = 20;
                const logoWidth = logoHeight * (logo.width / logo.height);
                doc.addImage(logoBase64, 'PNG', 180, 5, logoWidth, logoHeight);
            } else {
                doc.setFontSize(10);
                doc.text('Logo', 180, 20, { align: 'right' });
            }

            const pageWidth = 210;
            const sectionWidth = 210;
            const sectionX = (pageWidth - sectionWidth) / 2;
            doc.setFillColor(...lightGray);
            doc.rect(sectionX, 0, sectionWidth, 0, 'F');
            doc.setDrawColor(...borderColor);
            doc.rect(sectionX, 0, sectionWidth, 0);
            doc.setTextColor(...darkColor);
            doc.setFontSize(10);
            // Patient Info (Background removed)
            doc.setFontSize(10);
            doc.rect(0, 0, 190, 0); // Only draw border, no fill
            doc.text(`Name: ${patient.name}`, 15, 38);
            doc.text(`Age: ${patient.age}`, 70, 38);
            doc.text(`Gender: ${patient.gender}`, 90, 38);
            doc.text(`Blood Group: ${patient.bloodGroup}`, 120, 38);
            doc.text(`Phone: ${patient.phone}`, 155, 38);
            const leftWidth = 63;
            const rightWidth = 147;
            const totalContentWidth = leftWidth + rightWidth;
            const startX = (pageWidth - totalContentWidth) / 2;
            const startY = 45;

            doc.setFillColor(...lightGray);
            doc.rect(startX, startY, leftWidth, 200, 'F');
            doc.setDrawColor(...borderColor);
            doc.rect(startX, startY, leftWidth, 200);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...secondaryColor);
            doc.text('Vital Details', startX + 5, startY + 10, { align: 'left' });
            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            doc.setFont('helvetica', 'normal');
            const vitalX = startX + 5;
            doc.text(`Heart Rate: ${vital.heartRate ? `${vital.heartRate} bpm` : '-'}`, vitalX, startY + 15);
            doc.text(`Blood Pressure: ${vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg` : '-'}`, vitalX, startY + 20);
            doc.text(`Glucose Level: ${vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : '-'}`, vitalX, startY + 25);
            doc.text(`Oxygen Saturation: ${vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}`, vitalX, startY + 30);
            doc.text(`Temperature: ${vital.temperature ? `${vital.temperature}°C` : '-'}`, vitalX, startY + 35);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...secondaryColor);
            doc.text('Lab Tests', startX + 5, startY + 45, { align: 'left' });
            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            const labTests = vital.feedback?.labTests || [];
            let labY = startY + 50;
            labTests.forEach((test) => {
                if (labY > 250) {
                    doc.addPage();
                    labY = 20;
                }
                doc.text(`Test: ${test.testName}`, vitalX, labY);
                doc.text(`Urgency: ${test.urgency}`, vitalX, labY + 5);
                doc.text(`Status: ${test.status || '-'}`, vitalX, labY + 10);
                labY += 15;
            });
            if (labTests.length === 0) {
                doc.text('No lab tests.', vitalX, startY + 55);
            }

            const rightX = startX + leftWidth;
            doc.setFillColor(...primaryForeground);
            doc.rect(rightX, startY, rightWidth, 200, 'F');
            doc.setDrawColor(...borderColor);
            doc.rect(rightX, startY, rightWidth, 200);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...secondaryColor);
            doc.text('Medications', rightX + 5, startY + 10, { align: 'left' });
            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            const medX = rightX + 5;
            const prescriptions = vital.feedback?.prescriptions || [];
            let medY = startY + 15;
            if (prescriptions.length > 0) {
                prescriptions.forEach((p) => {
                    if (medY > 250) {
                        doc.addPage();
                        medY = 20;
                    }

                    const line = `Medication: ${p.medication} / ${p.brandName || '-'} / ${p.dosage} / ${p.duration} / ${p.instructions || '-'}`;
                    doc.text(line, medX, medY);
                    medY += 10; // Adjust spacing between lines
                });
            } else {
                doc.text('No medications prescribed.', medX, startY + 15);
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...secondaryColor);
            doc.text('Recommendations', rightX + 5, medY + 10, { align: 'left' });
            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            const recommendations = doc.splitTextToSize(vital.feedback?.recommendations || 'None', rightWidth - 10);
            doc.text(recommendations, medX, medY + 15);

            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            const infoX = (pageWidth - 170) / 2;
            // Doctor's Signature Section (Compact with name as signature)
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...darkColor);
            doc.text("Doctor's Signature:", infoX, 268);
            doc.setLineWidth(0.5);
            doc.line(infoX + 40, 268, infoX + 100, 268);

            // Doctor's Name as signature
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic'); // Simulate signature look
            doc.text(`Dr. ${doctor.name}`, infoX + 50, 266); // Slightly above the line
            // System-generated prescription note
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...textGray);
            doc.text(
                'This is a system-generated prescription. No physical signature or seal is required.',
                150,
                250,
                { align: 'center' }
            );

            // Date - moved to right
            doc.setFontSize(10);
            doc.setTextColor(...darkColor);
            doc.text(
                `Date: ${new Date(vital.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}`,
                190, // X position moved to the right
                268,
                { align: 'right' }
            );


            // Note
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...textGray);
            doc.text(
                'Note: Follow prescribed medications and recommendations. Contact your doctor for concerns.',
                105,
                278,
                { align: 'center' }
            );

            // Website and Appointment Info
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(
                'Visit our website: https://health-monitoring-system-five.vercel.app/',
                105,
                283,
                { align: 'center' }
            );
            doc.text(
                'Book your next appointment online or call us for support.',
                105,
                288,
                { align: 'center' }
            );
            return doc;
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
            return null;
        }
    };

    const handlePreview = () => {
        const doc = generatePDF();
        if (doc) {
            const pdfUrl = doc.output('datauristring');
            setPdfDataUrl(pdfUrl);
            setShowPreview(true);
        }
    };

    const handleDownload = () => {
        const doc = generatePDF();
        if (doc) {
            doc.save(`Prescription_${patient.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(vital.timestamp).toISOString().split('T')[0]}.pdf`);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPdfDataUrl(null);
    };

    return (
        <div className="">
            <div className="container mx-auto shadow-md bg-white rounded-xl w-full border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-blue-800 mb-6">Prescription</h3>
                {vital.feedback?.prescriptions && vital.feedback.prescriptions.length > 0 ? (
                    <div className="space-y-6">
                        {vital.feedback.prescriptions.map((prescription, index) => (
                            <div
                                key={index}
                                className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50 rounded-r-xl hover:bg-blue-100 transition-colors duration-200"
                            >
                                <p className="text-sm font-semibold text-gray-800">
                                    Medication: {prescription.medication}
                                </p>
                                {prescription.brandName && (
                                    <p className="text-sm text-gray-600">
                                        Brand: {prescription.brandName}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600">
                                    Dosage: {prescription.dosage}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Duration: {prescription.duration}
                                </p>
                                {prescription.instructions && (
                                    <p className="text-sm text-gray-600">
                                        Instructions: {prescription.instructions}
                                    </p>
                                )}
                            </div>
                        ))}
                        <div className="mt-6">
                            <button
                                onClick={handlePreview}
                                className="mt-4 flex w-full items-center gap-2 justify-between bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
                            >
                                <FileText size={18} />
                                Preview Prescription
                            </button>
                            <button
                                onClick={handleDownload}
                                className="mt-4 flex w-full items-center gap-2 justify-between bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/40 transition-colors"
                            >
                                <Download size={18} />
                                Download Prescription
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No prescriptions available</p>
                )}
            </div>

            {
                showPreview && pdfDataUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-[80vh] relative">
                            <button
                                onClick={handleClosePreview}
                                className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700"
                            >
                                Close
                            </button>
                            <iframe
                                src={pdfDataUrl}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PrescriptionGenerator;