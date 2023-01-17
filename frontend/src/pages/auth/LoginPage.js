import { Fragment, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../Ui/Input';
import Alert from '../../Ui/Alert';
import useTimeout from '../../hooks/use-timeout';
import classes from "./LoginPage.module.css";
import sendRequest from '../../helper/sendRequest';
const LoginPage = () => {
    const usernameInputRef = useRef();
    const passwordInputRef = useRef();

    const [isUsernameValid, setIsUsernameVaild] = useState(true);
    const [isPasswordValid, setIsPasswordVaild] = useState(true);
    const [isAlert, setIsAlert] = useTimeout(null, 4);

    const usernameFocusHandler = () => {
        setIsUsernameVaild(true);
    }
    const passwordFocusHandler = () => {
        setIsPasswordVaild(true);
    }
    const submitHandler = async (event) => {
        event.preventDefault();
        const enteredUsername = usernameInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;
        const usernameValid = enteredUsername.length > 5;
        const passwordVaild = enteredPassword.length > 5;
        // validate fields
        if (!usernameValid) {
            setIsUsernameVaild(false);
        }
        if (!passwordVaild) {
            setIsPasswordVaild(false);
        }
        const isFormVaild = usernameValid && passwordVaild;
        if (!isFormVaild) return;
        // console.log('form valid');

        const body = { username: enteredUsername, password: enteredPassword };
        const [data, error] = await sendRequest({
            method: 'POST',
            url: '/auth/login',
            body
        });
        if (error) {
            // console.log('error');
            setIsAlert(error);
            return;
        }
        console.log(data);
    }
    return (
        <Fragment>
            {isAlert && <Alert message={isAlert} />}
            <div className={`${classes.card} ${classes['form-class']}`}>
                <h2>Social Network</h2>
                <form onSubmit={submitHandler}>
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