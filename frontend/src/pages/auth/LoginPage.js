import { useRef } from 'react';
import classes from "./LoginPage.module.css";
const LoginPage = () => {
    const API_URL = 'http://localhost:3100/';
    const usernameInputRef = useRef();
    const passwordInputRef = useRef();
    const submitHandler = async (event) => {
        event.preventDefault();
        const enteredUsername = usernameInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;
        console.log(enteredUsername, enteredPassword);
        const formData = new URLSearchParams(Object.entries({ username: enteredUsername, password: enteredPassword })).toString()
        const response = await fetch(API_URL + 'api/login', {
            method: 'POST',
            body: formData,
            headers: {
                // 'Content-Type': 'application/json'
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const data = await response.json();
        console.log(data);
    }
    return (
        <div className={classes.card}>
            <h2>Social Network</h2>
            <form onSubmit={submitHandler}>
                <div>
                    <label>Username</label>
                    <input type="text" className={classes['form-control']} placeholder="usernmae" ref={usernameInputRef} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" className={classes['form-control']} placeholder="usernmae" ref={passwordInputRef} />
                </div>
                <button className={classes.button}>Log in</button>
            </form>
        </div>
    )
}

export default LoginPage;