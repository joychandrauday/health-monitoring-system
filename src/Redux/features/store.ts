import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import doctorReducer from '../features/doctor/doctorSlice';
import userReducer from '../features/user/userSlice';
import { baseApi } from '../api/baseApi';

export const makeStore = () => {
    return configureStore({
        reducer: {
            [baseApi.reducerPath]: baseApi.reducer,
            auth: authReducer,
            doctor: doctorReducer,
            user: userReducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];