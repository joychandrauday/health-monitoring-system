/* eslint-disable @typescript-eslint/no-explicit-any */
import { Doctor, Meta } from "@/components/Modules/Dashboard/Admin/Doctor/DocRequestTable";
import { IDoctor } from "@/types";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

export const GetDocRequest = async (
    page = 1
): Promise<{ users: Doctor[]; meta: Meta }> => {
    const session = await getServerSession(authOptions);

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/users?doctorRequest=true&page=${page}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await res.json();

        return {
            users: result?.data?.users || [],
            meta: result?.data?.meta || { total: 0, page: 1, limit: 10 },
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch doctor requests");
    }
};
export const GetAllDocs = async ({
    page = 1,
    limit = 10,
    token
}: { page?: number; limit?: number, token: string }): Promise<{
    doctors: IDoctor[];
    docMeta: Meta;
}> => {

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/doctors?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(res);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        return {
            doctors: result?.data?.doctors || [],
            docMeta: result?.data?.meta || { total: 0, page: 1, limit: 10 },
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch doctor requests");
    }
};
export const GetAllDocsSocket = async ({
    page = 1,
    limit = 10,
    token
}: { page?: number; limit?: number; token: string }): Promise<{
    doctors: IDoctor[];
    docMeta: Meta;
}> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/doctors?page=${page}&limit=${limit}`,
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
            doctors: result?.data?.doctors || [],
            docMeta: result?.data?.meta || { total: 0, page: 1, limit: 10 },
        };
    } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch doctor requests");
    }
};


export const approveDoctor = async (
    userId: string,
    token: string
): Promise<any> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/doctors/register/${userId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }), // ensure it's an object
            }
        );

        if (!res.ok) throw new Error("Failed to approve doctor");
        const updatedUser = await res.json();
        return updatedUser;
    } catch (error: any) {
        console.error("Error approving doctor:", error.message);
        return Error(error.message);
    }
};
export const deleteDoctor = async (
    userId: string,
    token: string
): Promise<any> => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/doctors/${userId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }), // ensure it's an object
            }
        );

        if (!res.ok) throw new Error("Failed to approve doctor");

        const updatedUser = await res.json();
        return updatedUser;
    } catch (error: any) {
        console.error("Error approving doctor:", error.message);
        return Error(error.message);
    }
};
