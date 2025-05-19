/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/Redux/api/baseApi";

const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUser: builder.query({
            query: (userId: string) => ({
                url: `/users/${userId}`,
                method: "GET",
            }),
            transformResponse: (response: { message: string; success: boolean; data: any }) => response.data,
        }),
        getUsers: builder.query({
            query: () => ({
                url: `/users`,
                method: "GET",
            }),
            transformResponse: (response: { message: string; success: boolean; data: any }) => response.data,
        }),
        deleteUser: builder.mutation({
            query: (userId: string) => ({
                url: `/users/${userId}`,
                method: "DELETE",
            }),
            transformResponse: (response: { message: string; success: boolean; data: any }) => response.data,
        }),
        updateUser: builder.mutation({
            query: ({ userId, updatedData }: { userId: string; updatedData: Partial<any> }) => ({
                url: `/users/${userId}`,
                method: "PATCH",
                body: updatedData,
            }),
            transformResponse: (response: { message: string; success: boolean; data: any }) => response.data,
        }),
    }),
});

export const {
    useGetUserQuery,
    useGetUsersQuery,
    useDeleteUserMutation,
    useUpdateUserMutation
} = usersApi;
