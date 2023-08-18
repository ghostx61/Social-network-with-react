import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    renderProfilePage: false,
}

const renderComponentSlice = createSlice({
    name: 'render',
    initialState,
    reducers: {
        renderProfilePage(state, action) {
            console.log('render redux change');
            return {
                renderProfilePage: !state.renderProfilePage
            }
        }
    }
});

export const renderActions = renderComponentSlice.actions;
export default renderComponentSlice;