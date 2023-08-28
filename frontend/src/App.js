import { Fragment, useEffect, useState } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import './App.css';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProfilePage from './pages/profile/ProfilePage';
import Navbar from './Ui/Navbar';
import sendRequest from './helper/sendRequest';
import useAuth from './hooks/use-Auth';
import HomePage from './pages/home/HomePage';
import { useSelector } from 'react-redux';
import LoadingSpinner from './Ui/LoadingSpinner';
import EditProfilePage from './pages/profile/EditProfilePage';
import ImageCropper from './Ui/image-crop/ImageCropper';
import ErrorPage from './pages/error/ErrorPage';
import FindFriendsPage from './pages/find-friends/FindFriendsPage';
import NavMobileBottom from './Ui/mobile-nav/nav-bottom/NavMobileBottom';


function App() {
  const token = localStorage.getItem('token');
  const authData = useSelector(state => state.auth);
  const isAuth = useSelector(state => state.auth.isAuthenticated);
  const [screenView, setScreenView] = useState('desktop');
  const { userLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // console.log('app render');
  useEffect(() => {
    // authenticate token
    async function checkAuth() {
      setIsLoading(true);
      if (token) {
        const [data, error] = await sendRequest({
          method: 'GET',
          url: '/auth/verify',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
        if (error) {
          setIsLoading(false)
          return;
        };
        userLogin({ token, id: data.id, username: data.username });
        // console.log(data);
        // console.log(authData)
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 600) {
        setScreenView('desktop');
      } else {
        setScreenView('mobile');
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const postUpdateHandler = () => {
    console.log('post update');
  }


  const authRoutes = (
    <Switch>
      <Route path='/login' exact>
        <LoginPage />
      </Route>
      <Route path='/signup' exact>
        <SignupPage />
      </Route>
      <Route path='*'>
        <Redirect to='/login' />
      </Route>
    </Switch>
  );

  const userRoutes = (
    <Switch>
      <Route path='/' exact>
        <HomePage />
      </Route>
      <Route path='/profile/:username' exact>
        <ProfilePage />
      </Route>
      {/* <Route path={['/', '/profile/:username']} exact>
        <HomePage />
      </Route> */}
      <Route path='/profile/:username/edit' exact>
        <EditProfilePage />
      </Route>
      <Route path='/find-friends' exact>
        <FindFriendsPage />
      </Route>
      <Route path='/crop' exact>
        <ImageCropper />
      </Route>
      <Route path='/error' exact>
        <ErrorPage />
      </Route>
      <Route path='*'>
        <Redirect to='/' />
      </Route>
    </Switch>
  )
  return (
    <Fragment>
      <Navbar onPostUpdate={postUpdateHandler} />
      <main>
        <section>
          {!isLoading &&
            <Fragment>
              {!isAuth && authRoutes}
              {isAuth && userRoutes}
            </Fragment>
          }
          {isLoading && <div className='center'><LoadingSpinner /></div>}
        </section>
      </main>
      {isAuth && screenView === 'mobile' && <NavMobileBottom />}
    </Fragment>
  );
}

export default App;
