/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

// get all products
export const getAllUsers = async (
    limit?: string,
    query?: string
) => {
    try {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/users?limit=${limit}&${query}`
        );
        const data = await res.json();
        return data;
    } catch (error: any) {
        return Error(error.message);
    }
};

export const getAllListingsByUser = async (page?: string, limit?: string) => {
    const session = await getServerSession(authOptions);

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/listings/user?limit=${limit}&page=${page}`,
            {
                headers: {
                    authorization: `${session?.user?.accessToken}`,
                },
            }
        );
        const data = await res.json();
        // revalidateTag("PRODUCT");
        return data;
    } catch (error: any) {
        return Error(error.message);
    }
};

// get single product
export const getSingleProduct = async (productId: string) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/listings/${productId}`,
        );
        const data = await res.json();
        return data;
    } catch (error: any) {
        return Error(error.message);
    }
};

export const addListing = async (listingData: any): Promise<any> => {
    const session = await getServerSession(authOptions);

    try {

        // Send the data as JSON in the request body
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/listings`, {
            method: "POST",
            body: JSON.stringify(listingData),  // Send data as JSON
            headers: {
                'Content-Type': 'application/json',  // Set content type to JSON
                authorization: `${session?.user?.accessToken}`,
            },
        });

        return res.json();  // Return the response as JSON
    } catch (error: any) {
        return Error(error);
    }
};


// update product
export const updateListing = async (
    productData: any,
    productId: string
): Promise<any> => {
    try {
        const session = await getServerSession(authOptions);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/listings/${productId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `${session?.user?.accessToken}`,
                },
                body: JSON.stringify(productData),
            }
        );
        return res.json();
    } catch (error: any) {
        return Error(error);
    }
};
export const deleteListing = async (
    productId: string
): Promise<any> => {
    try {
        const session = await getServerSession(authOptions);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/listings/${productId}`,
            {
                method: "DELETE",
                headers: {
                    authorization: `${session?.user?.accessToken}`,
                },
            }
        );
        return res.json();
    } catch (error: any) {
        return Error(error);
    }
};

// get all categories
export const getAllCategories = async () => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_API}/category`,
        );
        const data = await res.json();
        return data;
    } catch (error: any) {
        return Error(error.message);
    }
};