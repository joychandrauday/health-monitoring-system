/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppointment } from "@/types";

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const createAppointment = async (
    data: Partial<IAppointment>,
    token: string
): Promise<IAppointment> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        return result.data;
    } catch (error: any) {
        throw new Error(error?.message || "Failed to create appointment");
    }
};

export const getAllAppointments = async ({
    page = 1,
    limit = 10,
    status,
    type,
    startDate,
    endDate,
    token,
}: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    token: string;
}): Promise<{ appointments: IAppointment[]; meta: Meta }> => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status }),
            ...(type && { type }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        });

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments?${queryParams}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        return {
            appointments: result?.data?.appointments || [],
            meta: result?.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch appointments");
    }
};

export const getAppointmentsByUserId = async ({
    userId,
    page = 1,
    limit = 10,
    status,
    type,
    startDate,
    endDate,
    token,
}: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    token: string;
}): Promise<{ appointments: IAppointment[]; meta: Meta }> => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status }),
            ...(type && { type }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        });

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments/${userId}?${queryParams}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        return {
            appointments: result?.data?.appointments || [],
            meta: result?.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch user appointments");
    }
};

export const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    token: string
): Promise<{ success: boolean; message: string; data?: IAppointment }> => {
    try {
        if (!token) {
            throw new Error("No token provided");
        }

        const payload = { status };
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments/${appointmentId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        return {
            success: true,
            message: "Status updated successfully",
            data: result.data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to update appointment status",
        };
    }
};

export const deleteAppointment = async (
    id: string,
    token: string
): Promise<void> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
    } catch (error: any) {
        throw new Error(error?.message || "Failed to delete appointment");
    }
};


export const GetSingleAppointment = async ({
    appointmentId,
    token
}: { appointmentId: string; token: string }): Promise<{
    appointment: IAppointment;
}> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/appointments/single/${appointmentId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const result = await res.json();
        return {
            appointment: result || [],
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch vital");
    }
};