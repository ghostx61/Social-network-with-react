import { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import './App.css';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

function App() {
  return (
    <Fragment>
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
    </Fragment>
  );
}

export default App;
