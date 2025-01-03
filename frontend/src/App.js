import { Fragment, useEffect, useState } from "react";
import { Route, Switch, Redirect } from "react-router";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Navbar from "./Ui/Navbar";
import sendRequest from "./helper/sendRequest";
import useAuth from "./hooks/use-Auth";
import HomePage from "./pages/home/HomePage";
import { useSelector } from "react-redux";
import LoadingSpinner from "./Ui/LoadingSpinner";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ImageCropper from "./Ui/image-crop/ImageCropper";
import ErrorPage from "./pages/error/ErrorPage";
import FindFriendsPage from "./pages/find-friends/FindFriendsPage";
import NavMobileBottom from "./Ui/mobile-nav/nav-bottom/NavMobileBottom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import useSession from "./hooks/use-session";

function App() {
  const token = localStorage.getItem("token");
  const authData = useSelector((state) => state.auth);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector((state) => state.auth.role === "admin");
  const { createSession, updateSession } = useSession();
  // console.log(authData);
  const [screenView, setScreenView] = useState("desktop");
  const { userLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // console.log('app render');

  useEffect(() => {
    // authenticate token
    async function checkAuth() {
      setIsLoading(true);
      if (token) {
        const [data, error] = await sendRequest({
          method: "GET",
          url: "/auth/verify",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (error) {
          setIsLoading(false);
          return;
        }
        //track login
        updateSession("login", data.username);

        //login user
        userLogin({
          token,
          id: data.id,
          username: data.username,
          role: data.role,
        });
        // console.log(data);
        // console.log(authData)
      }
      setIsLoading(false);
    }
    // create a session
    console.log(isAdmin);
    if (sessionStorage.getItem("visit") === null) {
      (async () => {
        await createSession();
        checkAuth();
      })();
    } else {
      checkAuth();
    }
  }, []);

  // const [visitedPageCount, setVisitedPageCount] = useState(0);
  // const history = useHistory();

  // useEffect(() => {
  //   // This function will be called whenever the route changes
  //   const unlisten = history.listen((location, action) => {
  //     console.log("Page changed:", location.pathname);
  //     // You can perform any actions here based on the route change
  //   });

  //   // Cleanup function to unsubscribe from the history listener
  //   return () => {
  //     unlisten();
  //   };
  // }, [history]);

  /////////////////////
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 600) {
        setScreenView("desktop");
      } else {
        setScreenView("mobile");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const postUpdateHandler = () => {
    console.log("post update");
  };

  const authRoutes = (
    <Switch>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <Route path="/signup" exact>
        <SignupPage />
      </Route>
      <Route path="*">
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
  const adminRoutes = (
    <Switch>
      <Route path="/admin" exact>
        <AdminDashboard />
      </Route>
      <Route path="*">
        <Redirect to="/admin" />
      </Route>
    </Switch>
  );

  const userRoutes = (
    <Switch>
      <Route path="/" exact>
        <HomePage />
      </Route>
      <Route path="/profile/:username" exact>
        <ProfilePage />
      </Route>
      {/* <Route path={['/', '/profile/:username']} exact>
        <HomePage />
      </Route> */}
      <Route path="/profile/:username/edit" exact>
        <EditProfilePage />
      </Route>
      <Route path="/find-friends" exact>
        <FindFriendsPage />
      </Route>
      <Route path="/crop" exact>
        <ImageCropper />
      </Route>
      <Route path="/error" exact>
        <ErrorPage />
      </Route>
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );

  const sectionClass = isAuth && isAdmin ? "section-2" : "section-1";
  return (
    <Fragment>
      <Navbar onPostUpdate={postUpdateHandler} />
      <main>
        <section className={sectionClass}>
          {!isLoading && (
            <Fragment>
              {!isAuth && authRoutes}
              {isAuth && isAdmin && adminRoutes}
              {isAuth && !isAdmin && userRoutes}
            </Fragment>
          )}
          {isLoading && (
            <div className="center">
              <LoadingSpinner />
            </div>
          )}
        </section>
      </main>
      {isAuth && screenView === "mobile" && <NavMobileBottom />}
    </Fragment>
  );
}

export default App;
