/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Meta } from "@/components/Modules/Dashboard/Admin/Doctor/DocRequestTable";
import { User, Vital } from "@/types";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { FieldValues } from "react-hook-form";

export const PostVitals = async ({ data, token }: { data: FieldValues; token: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/vitals`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result;
  } catch (error: any) {
    return Error(error);
  }
};

export const GetVitalsByUserId = async ({
  userId,
  token,
  page
}: { userId: string; token: string; page: number }): Promise<{
  vitals: Vital[];
  vitamMeta: Meta;
}> => {

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/${userId}?page=${page}`,
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
      vitals: result?.data?.vitals || [],
      vitamMeta: result?.data?.meta || { total: 0, page: 1, limit: 10 },
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch doctor requests");
  }
};

// get Users by Doctors
export const GetPatientsByDocId = async ({
  docId,
}: { docId: string; }): Promise<{
  patients: User[];
}> => {

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/patients/${docId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    return {
      patients: result?.data.patients || [],
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch doctor requests");
  }
};

// get Users by Doctors
export const GetSingleVital = async ({
  userId,
}: { userId: string; }): Promise<{
  vital: Vital;
}> => {

  const session = await getServerSession(authOptions);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/single/${userId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    return {
      vital: result || [],
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch doctor requests");
  }
};