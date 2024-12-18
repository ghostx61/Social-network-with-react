import { useDispatch } from "react-redux";
import { globalDataActions } from "../store/global-data-slice";

const useGlobalData = () => {
  const dispatch = useDispatch();
  function setProfileImg(data) {
    dispatch(globalDataActions.changeProfileImg(data));
  }
  return { setProfileImg };
};

export default useGlobalData;
