import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth-slice";
import homepageScrollSlice from "./homepage-scroll-slice";
import modalSlice from "./modal-slice";
import renderSlice from "./render-component-slice";
import globalDataSlice from "./global-data-slice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    render: renderSlice.reducer,
    homepageScroll: homepageScrollSlice.reducer,
    modal: modalSlice.reducer,
    globalData: globalDataSlice.reducer,
  },
});

export default store;
