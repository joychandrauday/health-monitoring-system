import { createSlice } from '@reduxjs/toolkit';
import { User } from '@/types';

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        fetchUserRequest: (state, action: { payload: { userId: string } }) => {
            state.loading = true;
            state.error = null;
            console.log('Fetch User Request - User ID:', action.payload.userId);
        },
        fetchUserSuccess: (state, action: { payload: User }) => {
            state.loading = false;
            state.user = action.payload;
        },
        fetchUserFailure: (state, action: { payload: string }) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateUserRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateUserSuccess: (state, action: { payload: User }) => {
            state.loading = false;
            state.user = action.payload;
        },
        updateUserFailure: (state, action: { payload: string }) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetUserState: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    fetchUserRequest,
    fetchUserSuccess,
    fetchUserFailure,
    updateUserRequest,
    updateUserSuccess,
    updateUserFailure,
    resetUserState,
} = userSlice.actions;

export default userSlice.reducer;