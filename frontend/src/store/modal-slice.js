import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isPostModalOpen: false
}

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        toggleModal(state, action) {
            const setModalValue = action.payload.setModalValue;
            switch (action.payload.modalName) {
                case 'post':
                    return {
                        isPostModalOpen: setModalValue
                    }
                default:
                    return state;
            }
        }
    }
});

export const modalActions = modalSlice.actions;
export default modalSlice;