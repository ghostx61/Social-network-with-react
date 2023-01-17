import { Fragment, useRef, useState } from 'react';
import { Link } from 'react-router-dom'
import classes from "./SignupPage.module.css";
import Input from '../../Ui/Input';
import Alert from '../../Ui/Alert';
import useTimeout from '../../hooks/use-timeout';
import sendRequest from '../../helper/sendRequest';

const SignupPage = () => {
    const API_URL = 'http://localhost:3100/';
    const fnameInputRef = useRef();
    const lnameInputRef = useRef();
    const emailInputRef = useRef();
    const usernameInputRef = useRef();
    const passwordInputRef = useRef();

    const [isFnameValid, setIsFnameVaild] = useState(true);
    const [isLnameValid, setIsLnameVaild] = useState(true);
    const [isEmailValid, setIsEmailVaild] = useState(true);
    const [isUsernameValid, setIsUsernameVaild] = useState(true);
    const [isPasswordValid, setIsPasswordVaild] = useState(true);
    const [isAlert, setIsAlert] = useTimeout(null, 4);


    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const fnameFocusHandler = () => {
        setIsFnameVaild(true);
    }
    const lnameFocusHandler = () => {
        setIsLnameVaild(true);
    }
    const emailFocusHandler = () => {
        setIsEmailVaild(true);
    }
    const usernameFocusHandler = () => {
        setIsUsernameVaild(true);
    }
    const passwordFocusHandler = () => {
        setIsPasswordVaild(true);
    }

    const submitHandler = async (event) => {
        event.preventDefault();
        const enteredFname = fnameInputRef.current.value;
        const enteredLname = lnameInputRef.current.value;
        const enteredEmail = emailInputRef.current.value;
        const enteredUsername = usernameInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;

        // validate fields
        const fnameValid = enteredFname.length > 0;
        const lnameValid = enteredFname.length > 0;
        const emailValid = validateEmail(enteredEmail);
        const usernameValid = enteredUsername.length > 5;
        const passwordValid = enteredPassword.length > 5;
        if (!fnameValid) {
            setIsFnameVaild(false);
        }
        if (!lnameValid) {
            setIsLnameVaild(false);
        }
        if (!emailValid) {
            setIsEmailVaild(false);
        }
        if (!usernameValid) {
            setIsUsernameVaild(false);
        }
        if (!passwordValid) {
            setIsPasswordVaild(false);
        }
        // check form validity
        const isFormValid = fnameValid && lnameValid && emailValid && usernameValid && passwordValid;
        if (!isFormValid) {
            // console.log('invalid');
            return;
        }
        const body = {
            fname: enteredFname,
            lname: enteredLname,
            email: enteredEmail,
            username: enteredUsername,
            password: enteredPassword
        }
        const [data, error] = await sendRequest({
            method: 'POST',
            url: '/auth/signup',
            body
        });
        if (error) {
            console.log(error);
            setIsAlert(error);
            return;
        }
        console.log(data);
    }
    return <Fragment>
        {isAlert && <Alert message={isAlert} />}
        <div className={`${classes.card} ${classes['form-class']}`}>
            <h2>Social Network</h2>
            <form onSubmit={submitHandler}>
                {/* First name  */}
                <Input
                    ref={fnameInputRef}
                    title="First name"
                    type='text'
                    id='fname'
                    placeholder="John"
                    isValid={isFnameValid}
                    invalidMessage="First Name is required"
                    focus={fnameFocusHandler}
                />
                {/* Last name  */}
                <Input
                    ref={lnameInputRef}
                    title="Last name"
                    type='text'
                    id='lname'
                    placeholder="Doe"
                    isValid={isLnameValid}
                    invalidMessage="Last Name is required"
                    focus={lnameFocusHandler}
                />
                {/* Username  */}
                <Input
                    ref={usernameInputRef}
                    title="Username"
                    type='text'
                    id='username'
                    placeholder="john345"
                    isValid={isUsernameValid}
                    invalidMessage="Username should be 6 or more characters"
                    focus={usernameFocusHandler}
                />
                {/* Email address  */}
                <Input
                    ref={emailInputRef}
                    title="Email address"
                    type='text'
                    id='email'
                    placeholder="john@mail.com"
                    isValid={isEmailValid}
                    invalidMessage="Enter a valid email"
                    focus={emailFocusHandler}
                />
                {/* Password  */}
                <Input
                    ref={passwordInputRef}
                    title="Password"
                    type='password'
                    id='password'
                    placeholder="testing@123#"
                    isValid={isPasswordValid}
                    invalidMessage="Password should be 6 or more characters"
                    focus={passwordFocusHandler}
                />
                <button className={classes.button}>Sign up</button>
            </form>
        </div>
        <div className={`${classes.card} ${classes['form-sub']}`}>
            <p>Already have an account? <Link to="/login">Login</Link> </p>
        </div>
    </Fragment>
}

export default SignupPage;