import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        // baseUrl: 'http://localhost:5000/api/v1',
        baseUrl: 'https://health-monitoring-backend-0rmy.onrender.com/api/v1',
        credentials: 'include'
    }),
    endpoints: () => ({})
})