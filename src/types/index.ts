

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
    _id?: string;
    doctorId: string;
    patientId?: string | User;
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
    timestamp?: Date;
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