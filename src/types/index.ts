

export type Session = {
    user?: {
        name: string;
        email: string;
        image?: string;
        id?: string;
        accessToken?: string
    };
};
export interface User {
    _id: string;
    email: string;
    password: string;
    bio: string;
    name: string;
    role: 'patient' | 'doctor' | 'admin';
    avatar: string;
    doctorRequest: boolean;
    gender: 'male' | 'female' | 'other';
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    age: number;
    phone: string;
    address: Address;
    createdAt: Date;
    updatedAt: Date;
}

export interface Address {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface Review {
    user: string;
    content: string;
    ratings: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDoctor {
    _id?: string;
    user: User;
    major: string;
    qualifications: string[];
    experience: number; // in years
    bio: string;
    availableDays: string[]; // e.g., ['Monday', 'Wednesday']
    availableTime: {
        from: string; // e.g., "09:00"
        to: string;   // e.g., "17:00"
    };
    reviews: Review[];
    averageRating?: number; // 👈 Optional: because initially no rating
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Vital {
    success?: boolean;
    _id: string;
    patientId: string;
    doctorId: string;
    status: "acknowledged" | "pending" | "in-progress" | "completed";
    feedback?: {
        prescriptions?: {
            medication: string; // E.g., "Amoxicillin"
            brandName?: string; // E.g., "Amoxil"
            dosage: string; // "500mg twice daily"
            duration: string; // "7 days"
            instructions?: string; // "Take with food"
        }[];

        labTests?: {
            testName: string; // e.g., "CBC", "Lipid Panel"
            urgency: "routine" | "urgent";
            notes?: string; // e.g., "Fasting required"
            scheduledDate?: string; // ISO date format, e.g., "2025-05-23"
            labLocation?: string; // e.g., "XYZ Diagnostic Center"
            status?: "pending" | "completed" | "cancelled";
            resultLink?: string; // Optional link to results if available digitally
            physicianNote?: string; // For additional context from doctor
        }[];
        recommendations?: string; // General advice, e.g., "Rest, hydrate, follow-up in 3 days"
    };
    heartRate?: number; // Beats per minute (bpm)
    bloodPressure?: { systolic: number; diastolic: number }; // mmHg
    glucoseLevel?: number; // mg/dL
    oxygenSaturation?: number; // Percentage (e.g., 95-100%)
    temperature?: number; // Celsius
    respiratoryRate?: number; // Breaths per minute
    painLevel?: number; // Scale of 0-10
    injury?: {
        type: "internal" | "external" | "none";
        description?: string; // E.g., "Fractured rib" or "Laceration on left arm"
        severity?: "mild" | "moderate" | "severe";
    };
    visuals?: string[]; // URLs or references to images/scans
    notes?: string; // Additional clinical notes, e.g., "Patient reports dizziness"
    priority?: "low" | "medium" | "high"; // Urgency of the vital record
    timestamp: Date; // ISO date string
    updatedAt: Date; // Last updated timestamp
}

export interface IMedicalNotification {
    _id: string;
    sender: string | User;
    receiver: string | User;
    type: 'vital' | 'message' | 'appointments' | 'acknowledgment';
    message: string;
    url?: string;
    timestamp: Date;
    acknowledged: boolean;
}



export interface IAppointment extends Document {
    _id: string;
    patientId: string | User;
    doctorId: string | User;
    appointmentDate: string | Date;
    appointmentTime: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    type: 'in-person' | 'teleconsultation';
    payment?: {
        amount: number;
        currency: string;
        status: 'pending' | 'completed' | 'failed' | 'refunded';
        transactionId?: string;
        paymentMethod?: 'credit_card' | 'debit_card' | 'online_payment' | 'insurance';
        paidAt?: Date;
    };
    vital: string;
    reason: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}