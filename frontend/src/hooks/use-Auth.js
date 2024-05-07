import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { authActions } from "../store/auth-slice";
const useAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  function userLogin(data) {
    dispatch(authActions.login(data));
    localStorage.setItem("token", data.token);
    // history.replace('/profile');
  }
  function userLogout() {
    dispatch(authActions.logout());
    localStorage.removeItem("token");
    history.replace("/login");
  }
  return { userLogin, userLogout };
};
export default useAuth;
