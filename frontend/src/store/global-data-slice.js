import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profileImg: "/profile-pic-default.webp",
};

const globalDataSlice = createSlice({
  name: "globalData",
  initialState,
  reducers: {
    changeProfileImg(state, action) {
      console.log(action.payload);
      return {
        profileImg: action.payload,
      };
    },
  },
});

export const globalDataActions = globalDataSlice.actions;
export default globalDataSlice;
