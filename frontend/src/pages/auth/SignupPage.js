import { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import classes from "./SignupPage.module.css";
import Input from "../../Ui/Input";
import Alert from "../../Ui/Alert";
import useTimeout from "../../hooks/use-timeout";
import sendRequest from "../../helper/sendRequest";
import useInput from "../../hooks/use-input";
import useAuth from "../../hooks/use-Auth";
import LoadingSpinner from "../../Ui/LoadingSpinner";

const SignupPage = () => {
  const [isAlert, setIsAlert] = useTimeout(null, 4);
  const { userLogin } = useAuth();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [
    fnameInput,
    setFnameInput,
    fnameInputChangeHandler,
    isFnameValid,
    setIsFnameVaild,
    checkFnameValid,
    fnameFocusHandler,
  ] = useInput();
  const [
    lnameInput,
    setLnameInput,
    lnameInputChangeHandler,
    isLnameValid,
    setIsLnameVaild,
    checkLnameValid,
    lnameFocusHandler,
  ] = useInput();
  const [
    emailInput,
    setEmailInput,
    emailInputChangeHandler,
    isEmailValid,
    setIsEmailVaild,
    checkEmailValid,
    emailFocusHandler,
  ] = useInput();
  const [
    usernameInput,
    setUsernameInput,
    usernameInputChangeHandler,
    isUsernameValid,
    setIsUsernameVaild,
    checkUsernameValid,
    usernameFocusHandler,
  ] = useInput();
  const [
    passwordInput,
    setPasswordInput,
    passwordInputChangeHandler,
    isPasswordValid,
    setIsPasswordVaild,
    checkPasswordValid,
    passwordFocusHandler,
  ] = useInput();

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  const submitHandler = async (event) => {
    event.preventDefault();
    setIsFormSubmitting(true);
    // console.log(fnameInput);
    // check form validity
    let isFormValid = true;
    if (fnameInput.length < 1) {
      setIsFnameVaild(false);
      isFormValid = false;
    }
    if (lnameInput.length < 1) {
      setIsLnameVaild(false);
      isFormValid = false;
    }
    if (!validateEmail(emailInput)) {
      setIsEmailVaild(false);
      isFormValid = false;
    }
    if (usernameInput.length <= 5) {
      setIsUsernameVaild(false);
      isFormValid = false;
    }
    if (passwordInput.length <= 5) {
      setIsPasswordVaild(false);
      isFormValid = false;
    }
    if (!isFormValid) {
      setIsAlert("Invalid Details");
      setIsFormSubmitting(false);
      return;
    }
    const body = {
      fname: fnameInput,
      lname: lnameInput,
      email: emailInput,
      username: usernameInput,
      password: passwordInput,
    };
    const [data, error] = await sendRequest({
      method: "POST",
      url: "/auth/signup",
      body,
    });
    setIsFormSubmitting(false);
    if (error) {
      console.log(error);
      setIsAlert(error);
      return;
    }
    console.log(data);
    userLogin(data);
  };
  return (
    <Fragment>
      {isAlert && <Alert message={isAlert} />}
      <div className={`${classes.card} ${classes["form-class"]}`}>
        <h2>Social Network</h2>
        <form onSubmit={submitHandler}>
          {/* First name  */}
          <Input
            title="First name*"
            type="text"
            id="fname"
            placeholder="John"
            isValid={isFnameValid}
            invalidMessage="First Name is required"
            focus={fnameFocusHandler}
            value={fnameInput}
            change={fnameInputChangeHandler}
          />
          {/* Last name  */}
          <Input
            title="Last name*"
            type="text"
            id="lname"
            placeholder="Doe"
            isValid={isLnameValid}
            invalidMessage="Last Name is required"
            focus={lnameFocusHandler}
            value={lnameInput}
            change={lnameInputChangeHandler}
          />
          {/* Username  */}
          <Input
            title="Username*"
            type="text"
            id="username"
            placeholder="john345"
            isValid={isUsernameValid}
            invalidMessage="Username should be more than 6 characters"
            focus={usernameFocusHandler}
            value={usernameInput}
            change={usernameInputChangeHandler}
          />
          {/* Email address  */}
          <Input
            title="Email address*"
            type="text"
            id="email"
            placeholder="john@mail.com"
            isValid={isEmailValid}
            invalidMessage="Enter valid email"
            focus={emailFocusHandler}
            value={emailInput}
            change={emailInputChangeHandler}
          />
          {/* Password  */}
          <Input
            title="Password*"
            type="password"
            id="password"
            placeholder=""
            isValid={isPasswordValid}
            invalidMessage="Password should be more than 5 characters"
            focus={passwordFocusHandler}
            value={passwordInput}
            change={passwordInputChangeHandler}
          />
          {!isFormSubmitting && (
            <button className={classes.button}>Sign up</button>
          )}
          {isFormSubmitting && (
            <div className="center">
              <LoadingSpinner />
            </div>
          )}
        </form>
      </div>
      <div className={`${classes.card} ${classes["form-sub"]}`}>
        <p>
          Already have an account? <Link to="/login">Login</Link>{" "}
        </p>
      </div>
    </Fragment>
  );
};

export default SignupPage;
