import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    scrollY: 0
}

const homepageScrollSlice = createSlice({
    name: 'homepageScroll',
    initialState,
    reducers: {
        setScrollPosY(state, action) {
            // console.log(action.payload);
            return {
                scrollY: action.payload
            }
        }
    }
});

export const homepageScrollActions = homepageScrollSlice.actions;
export default homepageScrollSlice;