import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth-slice';
import renderSlice from './render-component-slice';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        render: renderSlice.reducer
    }
});

export default store;