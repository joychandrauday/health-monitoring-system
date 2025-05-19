import { createSlice } from '@reduxjs/toolkit';
import { IDoctor } from '@/types';

interface DoctorState {
    doctor: IDoctor | null;
    loading: boolean;
    error: string | null;
}

const initialState: DoctorState = {
    doctor: null,
    loading: false,
    error: null,
};

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        fetchDoctorRequest: (state, action: { payload: { doctorId: string } }) => {
            state.loading = true;
            state.error = null;
            console.log('Fetch Doctor Request - Doctor ID:', action.payload.doctorId);
        },
        fetchDoctorSuccess: (state, action: { payload: IDoctor }) => {
            state.loading = false;
            state.doctor = action.payload;
            console.log('Fetch Doctor Success - Doctor Data:', action.payload);
        },
        fetchDoctorFailure: (state, action: { payload: string }) => {
            state.loading = false;
            state.error = action.payload;
            console.log('Fetch Doctor Failure - Error:', action.payload);
        },
        updateDoctorRequest: (state) => {
            state.loading = true;
            state.error = null;
            console.log('Update Doctor Request');
        },
        updateDoctorSuccess: (state, action: { payload: IDoctor }) => {
            state.loading = false;
            state.doctor = action.payload;
            console.log('Update Doctor Success - Doctor Data:', action.payload);
        },
        updateDoctorFailure: (state, action: { payload: string }) => {
            state.loading = false;
            state.error = action.payload;
            console.log('Update Doctor Failure - Error:', action.payload);
        },
        resetDoctorState: (state) => {
            state.doctor = null;
            state.loading = false;
            state.error = null;
            console.log('Doctor State Reset');
        },
    },
});

export const {
    fetchDoctorRequest,
    fetchDoctorSuccess,
    fetchDoctorFailure,
    updateDoctorRequest,
    updateDoctorSuccess,
    updateDoctorFailure,
    resetDoctorState,
} = doctorSlice.actions;

export default doctorSlice.reducer;