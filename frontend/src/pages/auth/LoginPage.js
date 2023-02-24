import { Fragment, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Input from '../../Ui/Input';
import Alert from '../../Ui/Alert';
import useTimeout from '../../hooks/use-timeout';
import classes from "./LoginPage.module.css";
import sendRequest from '../../helper/sendRequest';
import useAuth from '../../hooks/use-Auth';
import useInput from '../../hooks/use-input';


const LoginPage = () => {
    const [isAlert, setIsAlert] = useTimeout(null, 4);
    const { userLogin } = useAuth();

    const [
        usernameInput,
        setUsernameInput,
        usernameInputChangeHandler,
        isUsernameValid,
        setIsUsernameVaild,
        checkUsernameValid,
        usernameFocusHandler
    ] = useInput();
    const [
        passwordInput,
        setPasswordInput,
        passwordInputChangeHandler,
        isPasswordValid,
        setIsPasswordVaild,
        checkPasswordValid,
        passwordFocusHandler
    ] = useInput();


    const submitHandler = async (event) => {
        event.preventDefault();
        // validate fields
        let isFormValid = true;
        if (usernameInput.length <= 5) {
            setIsUsernameVaild(false);
            isFormValid = false;
        }
        if (passwordInput.length <= 5) {
            setIsPasswordVaild(false);
            isFormValid = false;
        }
        if (!isFormValid) return;

        const body = { username: usernameInput, password: passwordInput };
        const [data, error] = await sendRequest({
            method: 'POST',
            url: '/auth/login',
            body
        });
        if (error) {
            setIsAlert(error);
            return;
        }
        console.log(data);
        //login user
        userLogin(data);
    }
    return (
        <Fragment>
            {isAlert && <Alert message={isAlert} />}
            <div className={`${classes.card} ${classes['form-class']}`}>
                <h2>Social Network</h2>
                <form onSubmit={submitHandler}>
                    {/* Username  */}
                    <Input
                        title="Username*"
                        type='text'
                        id='username'
                        placeholder="john345"
                        isValid={isUsernameValid}
                        invalidMessage="Username should be more than 6 characters"
                        focus={usernameFocusHandler}
                        value={usernameInput}
                        change={usernameInputChangeHandler}
                    />
                    {/* Password  */}
                    <Input
                        title="Password*"
                        type='password'
                        id='password'
                        placeholder=""
                        isValid={isPasswordValid}
                        invalidMessage="Password should be more than 6 characters"
                        focus={passwordFocusHandler}
                        value={passwordInput}
                        change={passwordInputChangeHandler}
                    />
                    <button className={classes.button}>Log in</button>
                </form>
            </div>
            <div className={`${classes.card} ${classes['form-sub']}`}>
                <p>Don't have an account? <Link to="/signup">Sign up</Link> </p>
            </div>
        </Fragment>
    )
}

export default LoginPage;