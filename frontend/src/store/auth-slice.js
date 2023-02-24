import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    token: null,
    userId: null,
    username: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            return {
                isAuthenticated: true,
                token: action.payload.token,
                userId: action.payload.id,
                username: action.payload.username
            }
        },
        logout() {
            return initialState;
        }
    }
});

export const authActions = authSlice.actions;
export default authSlice;