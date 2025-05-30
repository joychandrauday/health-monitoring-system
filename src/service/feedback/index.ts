/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Labtest {
    testName: string; // e.g., "CBC", "Lipid Panel"
    urgency: "routine" | "urgent";
    notes?: string; // e.g., "Fasting required"
    scheduledDate?: string; // ISO date format, e.g., "2025-05-23"
    labLocation?: string; // e.g., "XYZ Diagnostic Center"
    status?: "pending" | "completed" | "cancelled";
    resultLink?: string; // Optional link to results if available digitally
    physicianNote?: string; // For additional context from doctor
}
export interface Medication {
    medication: string; // E.g., "Amoxicillin"
    brandName?: string; // E.g., "Amoxil"
    dosage: string; // "500mg twice daily"
    duration: string; // "7 days"
    instructions?: string; // "Take with food"
}

export const AddMedicine = async (
    vitalId: string,
    medData: any,
    token: string
): Promise<any> => {
    try {
        const payload = {
            data: medData, // ✅ wrap with `data`
        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/prescriptions/add`,
            {
                method: "PATCH", // or "PUT" if your backend uses PUT
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating medicine:", error.message);
        throw new Error(error.message);
    }
};
export const UpdateMedicine = async (
    vitalId: string,
    medData: Medication,
    token: string
): Promise<any> => {
    try {
        // Optional: Log input
        const payload = {
            match: {
                "medication": medData.medication
            },
            update: medData, // ✅ wrap with `data`
        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/prescriptions/update`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating medicine:", error.message);
        throw new Error(error.message);
    }
};
export const DeleteMedicine = async (
    vitalId: string,
    medication: string,
    token: string
): Promise<any> => {
    try {
        // Optional: Log input
        const payload = {
            data: {
                "medication": medication
            },

        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/prescriptions/delete`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating medicine:", error.message);
        throw new Error(error.message);
    }
};

export const AddLabTest = async (
    vitalId: string,
    medData: any,
    token: string
): Promise<any> => {
    try {
        const payload = {
            data: medData, // ✅ wrap with `data`
        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/labtests/add`,
            {
                method: "PATCH", // or "PUT" if your backend uses PUT
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating LabTest:", error.message);
        throw new Error(error.message);
    }
};
export const UpdateLabTest = async (
    vitalId: string,
    medData: Labtest,
    token: string
): Promise<any> => {
    try {
        // Optional: Log input
        const payload = {
            match: {
                "testName": medData.testName
            },
            update: medData, // ✅ wrap with `data`
        };

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/labtests/update`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating LabTest:", error.message);
        throw new Error(error.message);
    }
};
export const DeleteLabTest = async (
    vitalId: string,
    medication: string,
    token: string
): Promise<any> => {
    try {
        // Optional: Log input
        const payload = {
            data: {
                "testName": medication
            },

        };
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/labtests/delete`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating medicine:", error.message);
        throw new Error(error.message);
    }
};
export const addRecommendationOnVital = async (
    vitalId: string,
    recommendation: string,
    token: string
): Promise<any> => {
    try {
        // Optional: Log input
        const payload = {
            "recommendations": recommendation
        };
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${vitalId}/recommendation`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update prescription");
        }

        const updatedVital = await res.json();
        return updatedVital;
    } catch (error: any) {
        console.error("Error updating medicine:", error.message);
        throw new Error(error.message);
    }
};
