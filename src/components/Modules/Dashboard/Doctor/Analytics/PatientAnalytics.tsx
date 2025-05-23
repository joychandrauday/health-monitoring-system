'use client';
import React, { useState, useRef } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define interfaces for the patient data structure
interface Injury {
    type: string;
    description: string;
    severity: string;
}

interface BloodPressure {
    systolic?: number;
    diastolic?: number;
}

interface PatientData {
    heartRate: number[];
    bloodPressure: BloodPressure[];
    glucoseLevel: number[];
    oxygenSaturation: number[];
    temperature: number[];
    respiratoryRate: number[];
    painLevel: number[];
    injury: Injury[];
    timestamps: string[];
}

interface PatientAnalyticsProps {
    patientId: string;
    data: PatientData;
}

// Utility function to calculate statistics
const calculateStats = (data: (number | null)[]): { avg: string; min: string; max: string } => {
    const validData = data.filter((val): val is number => val !== null);
    if (validData.length === 0) return { avg: 'N/A', min: 'N/A', max: 'N/A' };
    const avg = validData.reduce((sum, val) => sum + val, 0) / validData.length;
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    return { avg: avg.toFixed(1), min: min.toString(), max: max.toString() };
};

const PatientAnalytics: React.FC<PatientAnalyticsProps> = ({ patientId, data }) => {
    const { heartRate, bloodPressure, glucoseLevel, oxygenSaturation, temperature, respiratoryRate, painLevel, injury, timestamps } = data;
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const chartsRef = useRef<HTMLDivElement>(null);

    // Filter data based on date range
    const filteredData = timestamps
        .map((ts, index) => ({
            timestamp: ts,
            label: new Date(ts).toLocaleString(),
            heartRate: heartRate[index] ?? null,
            bloodPressureSystolic: bloodPressure[index]?.systolic ?? null,
            bloodPressureDiastolic: bloodPressure[index]?.diastolic ?? null,
            glucoseLevel: glucoseLevel[index] ?? null,
            oxygenSaturation: oxygenSaturation[index] ?? null,
            temperature: temperature[index] ?? null,
            respiratoryRate: respiratoryRate[index] ?? null,
            painLevel: painLevel[index] ?? null,
        }))
        .filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            return (
                (!start || entryDate >= start) &&
                (!end || entryDate <= new Date(end.setHours(23, 59, 59, 999)))
            );
        });

    // Prepare chart data for Recharts
    const chartData = filteredData.map((entry) => ({
        timestamp: entry.label,
        heartRate: entry.heartRate,
        bloodPressureSystolic: entry.bloodPressureSystolic,
        bloodPressureDiastolic: entry.bloodPressureDiastolic,
        glucoseLevel: entry.glucoseLevel,
        oxygenSaturation: entry.oxygenSaturation,
        temperature: entry.temperature,
        respiratoryRate: entry.respiratoryRate,
        painLevel: entry.painLevel,
    }));

    // Calculate statistics for filtered data
    const stats = {
        heartRate: calculateStats(filteredData.map((d) => d.heartRate)),
        bloodPressureSystolic: calculateStats(filteredData.map((d) => d.bloodPressureSystolic)),
        bloodPressureDiastolic: calculateStats(filteredData.map((d) => d.bloodPressureDiastolic)),
        glucoseLevel: calculateStats(filteredData.map((d) => d.glucoseLevel)),
        oxygenSaturation: calculateStats(filteredData.map((d) => d.oxygenSaturation)),
        temperature: calculateStats(filteredData.map((d) => d.temperature)),
        respiratoryRate: calculateStats(filteredData.map((d) => d.respiratoryRate)),
        painLevel: calculateStats(filteredData.map((d) => d.painLevel)),
    };

    // Filter injuries within date range
    const filteredInjuries = injury.filter((inj, index) => {
        const entryDate = new Date(timestamps[index]);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (
            (!start || entryDate >= start) &&
            (!end || entryDate <= new Date(end.setHours(23, 59, 59, 999)))
        );
    });

    // Chart configurations
    const chartConfigs: {
        id: string;
        title: string;
        dataKeys: { key: string; label: string; color: string }[];
        yAxisLabel: string;
    }[] = [
            {
                id: 'heartRateChart',
                title: 'Heart Rate',
                dataKeys: [{ key: 'heartRate', label: 'Heart Rate (bpm)', color: '#FF6384' }],
                yAxisLabel: 'Heart Rate (bpm)',
            },
            {
                id: 'bloodPressureChart',
                title: 'Blood Pressure',
                dataKeys: [
                    { key: 'bloodPressureSystolic', label: 'Systolic (mmHg)', color: '#36A2EB' },
                    { key: 'bloodPressureDiastolic', label: 'Diastolic (mmHg)', color: '#4BC0C0' },
                ],
                yAxisLabel: 'Blood Pressure (mmHg)',
            },
            {
                id: 'glucoseLevelChart',
                title: 'Glucose Level',
                dataKeys: [{ key: 'glucoseLevel', label: 'Glucose Level (mg/dL)', color: '#FF9F40' }],
                yAxisLabel: 'Glucose Level (mg/dL)',
            },
            {
                id: 'oxygenSaturationChart',
                title: 'Oxygen Saturation',
                dataKeys: [{ key: 'oxygenSaturation', label: 'Oxygen Saturation (%)', color: '#9966FF' }],
                yAxisLabel: 'Oxygen Saturation (%)',
            },
            {
                id: 'temperatureChart',
                title: 'Temperature',
                dataKeys: [{ key: 'temperature', label: 'Temperature (°C)', color: '#FFCD56' }],
                yAxisLabel: 'Temperature (°C)',
            },
            {
                id: 'respiratoryRateChart',
                title: 'Respiratory Rate',
                dataKeys: [{ key: 'respiratoryRate', label: 'Respiratory Rate (breaths/min)', color: '#4BC0C0' }],
                yAxisLabel: 'Respiratory Rate (breaths/min)',
            },
            {
                id: 'painLevelChart',
                title: 'Pain Level',
                dataKeys: [{ key: 'painLevel', label: 'Pain Level (1-10)', color: '#FF6384' }],
                yAxisLabel: 'Pain Level (1-10)',
            },
        ];

    // Function to download PDF
    const downloadPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        let yOffset = margin;

        // Add title
        pdf.setFontSize(16);
        pdf.text(`Patient Analytics (ID: ${patientId})`, margin, yOffset);
        yOffset += 10;

        // Add date range
        pdf.setFontSize(12);
        pdf.text(
            `Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'All'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'All'
            }`,
            margin,
            yOffset
        );
        yOffset += 10;

        // Add Summary Statistics
        pdf.setFontSize(14);
        pdf.text('Summary Statistics', margin, yOffset);
        yOffset += 8;

        pdf.setFontSize(10);
        const statsTable = [
            ['Metric', 'Average', 'Min', 'Max'],
            ['Heart Rate (bpm)', stats.heartRate.avg, stats.heartRate.min, stats.heartRate.max],
            ['Blood Pressure Systolic (mmHg)', stats.bloodPressureSystolic.avg, stats.bloodPressureSystolic.min, stats.bloodPressureSystolic.max],
            ['Blood Pressure Diastolic (mmHg)', stats.bloodPressureDiastolic.avg, stats.bloodPressureDiastolic.min, stats.bloodPressureDiastolic.max],
            ['Glucose Level (mg/dL)', stats.glucoseLevel.avg, stats.glucoseLevel.min, stats.glucoseLevel.max],
            ['Oxygen Saturation (%)', stats.oxygenSaturation.avg, stats.oxygenSaturation.min, stats.oxygenSaturation.max],
            ['Temperature (°C)', stats.temperature.avg, stats.temperature.min, stats.temperature.max],
            ['Respiratory Rate (breaths/min)', stats.respiratoryRate.avg, stats.respiratoryRate.min, stats.respiratoryRate.max],
            ['Pain Level (1-10)', stats.painLevel.avg, stats.painLevel.min, stats.painLevel.max],
        ];

        statsTable.forEach((row) => {
            row.forEach((cell, cellIndex) => {
                pdf.text(cell, margin + cellIndex * 45, yOffset);
            });
            yOffset += 6;
        });
        yOffset += 10;

        // Add Charts
        if (chartsRef.current) {
            const chartElements = chartsRef.current.querySelectorAll('.chart-container');
            for (let i = 0; i < chartElements.length; i++) {
                const chart = chartElements[i] as HTMLElement;
                const canvas = await html2canvas(chart, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (yOffset + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    yOffset = margin;
                }

                pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 10;
            }
        }

        // Add Injury Summary
        pdf.setFontSize(14);
        pdf.text('Injury Summary', margin, yOffset);
        yOffset += 8;

        pdf.setFontSize(10);
        if (filteredInjuries.length > 0) {
            filteredInjuries.forEach((inj, index) => {
                const text = `${index + 1}. ${inj.type.toUpperCase()} (${inj.severity}): ${inj.description}`;
                const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                lines.forEach((line: string) => {
                    if (yOffset > pageHeight - margin) {
                        pdf.addPage();
                        yOffset = margin;
                    }
                    pdf.text(line, margin, yOffset);
                    yOffset += 6;
                });
            });
        } else {
            pdf.text('No injuries reported.', margin, yOffset);
            yOffset += 6;
        }

        // Save PDF
        pdf.save(`patient_analytics_${patientId}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Patient Analytics (ID: {patientId})</h1>

            {/* Date Range Filter and Download Button */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full sm:w-40"
                            aria-label="Select start date"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full sm:w-40"
                            aria-label="Select end date"
                        />
                    </div>
                </div>
                <Button
                    onClick={downloadPDF}
                    className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={filteredData.length === 0}
                >
                    Download PDF
                </Button>
            </div>

            {/* Summary Statistics Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Summary Statistics</h2>
                {filteredData.length === 0 ? (
                    <p className="text-gray-600">No data available for the selected date range.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Heart Rate (bpm)', stats: stats.heartRate },
                            { label: 'Blood Pressure Systolic (mmHg)', stats: stats.bloodPressureSystolic },
                            { label: 'Blood Pressure Diastolic (mmHg)', stats: stats.bloodPressureDiastolic },
                            { label: 'Glucose Level (mg/dL)', stats: stats.glucoseLevel },
                            { label: 'Oxygen Saturation (%)', stats: stats.oxygenSaturation },
                            { label: 'Temperature (°C)', stats: stats.temperature },
                            { label: 'Respiratory Rate (breaths/min)', stats: stats.respiratoryRate },
                            { label: 'Pain Level (1-10)', stats: stats.painLevel },
                        ].map(({ label, stats }) => (
                            <div key={label} className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-lg font-medium text-gray-600">{label}</h3>
                                <p className="text-sm">Average: {stats.avg}</p>
                                <p className="text-sm">Min: {stats.min}</p>
                                <p className="text-sm">Max: {stats.max}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chartConfigs.map((config) => (
                    <div key={config.id} className="bg-white p-6 rounded-lg shadow-md chart-container">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">{config.title}</h3>
                        {filteredData.length === 0 ? (
                            <p className="text-gray-600 text-center">No data available.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={filteredData.length === 0 ? [] : chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value: number) => (value !== null ? value : 'N/A')} />
                                    <Legend />
                                    {config.dataKeys.map(({ key, label, color }) => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            name={label}
                                            stroke={color}
                                            strokeWidth={2}
                                            dot={{ r: 5 }}
                                            activeDot={{ r: 8 }}
                                            isAnimationActive={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                ))}
            </div>

            {/* Injury Summary Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Injury Summary</h2>
                {filteredInjuries.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {filteredInjuries.map((inj, index) => (
                            <li key={index} className="mb-2 text-gray-600">
                                <span className="font-medium text-gray-800">{inj.type.toUpperCase()} ({inj.severity}): </span>
                                {inj.description}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No injuries reported for the selected date range.</p>
                )}
            </div>
        </div>
    );
};

export default PatientAnalytics;