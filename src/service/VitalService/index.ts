/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Meta } from "@/components/Modules/Dashboard/Admin/Doctor/DocRequestTable";
import { User, Vital } from "@/types";
import { FieldValues } from "react-hook-form";

export const PostVitals = async ({ data, token }: { data: FieldValues; token: string }) => {
  console.log(data);
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

    console.log(result);
    return {
      patients: result?.data || [],
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch doctor requests");
  }
};

export const GetSingleVital = async ({
  vitalId,
  token
}: { vitalId: string; token: string }): Promise<{
  vital: Vital;
}> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/vitals/single/${vitalId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(vitalId);
    const result = await res.json();
    return {
      vital: result || [],
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch vital");
  }
};