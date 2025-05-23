export interface BloodPressure {
    systolic?: number;
    diastolic?: number;
}

export interface Injury {
    type: 'internal' | 'external';
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
}

export interface VitalData {
    heartRate: number[];
    bloodPressure: BloodPressure[];
    glucoseLevel: number[];
    oxygenSaturation: number[];
    temperature: number[];
    respiratoryRate: number[];
    painLevel: number[];
    injury: Injury[];
    visuals: string[];
    timestamps: string[];
}

export interface PatientVitalRequest {
    patientId: string;
    data: VitalData;
}

export const getPatientAnalytics = async ({ patientId, token }: { patientId: string, token: string }): Promise<VitalData> => {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_API}/analytics/${patientId}`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})) as { message?: string };
            throw new Error(
                errorData.message || `Failed to fetch patient analytics. Status code: ${res.status}`
            );
        }

        const response = await res.json() as PatientVitalRequest;
        if (!response.data) {
            throw new Error('No patient data returned from API');
        }

        return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching patient analytics:', errorMessage);
        throw new Error(errorMessage);
    }
};