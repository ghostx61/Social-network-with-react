import { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import './App.css';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProfilePage from './pages/profile/ProfilePage';
import Navbar from './Ui/Navbar';

function App() {
  return (
    <Fragment>
      <Navbar />
      <main>
        <section>
          <Switch>
            <Route path='/login' exact>
              <LoginPage />
            </Route>
            <Route path='/signup' exact>
              <SignupPage />
            </Route>
            <Route path='/profile' exact>
              <ProfilePage />
            </Route>
            {/* <Route path='/navbar' exact>
            <Navbar />
          </Route> */}
            <Route path='*'>
              <Redirect to='/login' />
            </Route>
          </Switch>
        </section>
      </main>
    </Fragment>
  );
}

export default App;
