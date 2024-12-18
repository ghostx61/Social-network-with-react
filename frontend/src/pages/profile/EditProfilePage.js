import { Fragment, useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import classes from "./EditProfilePage.module.css";
import { useSelector } from "react-redux";

import Input from "../../Ui/Input";
import Alert from "../../Ui/Alert";
import sendRequest from "../../helper/sendRequest";
import useTimeout from "../../hooks/use-timeout";
import TextArea from "../../Ui/TextArea";
import useInput from "../../hooks/use-input";
import { validateEmail, validateDob } from "../../helper/validate";
import { formatDate } from "../../helper/dataTransform";
import LoadingSpinner from "../../Ui/LoadingSpinner";
import ImageCropper from "../../Ui/image-crop/ImageCropper";
import useGlobalData from "../../hooks/use-global-data";

const EditProfilePage = () => {
  const history = useHistory();
  const [isAlert, setIsAlert] = useTimeout(null, 4);
  const authData = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProfileImgLoading, setIsProfileImgLoading] = useState(false);
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false);
  const profileImgRef = useRef();
  //   const [profileImg, setProfileImg] = useState("/profile-pic-default.webp");
  const { setProfileImg } = useGlobalData();
  const profileImg = useSelector((state) => state.globalData.profileImg);
  const [oldProfileImg, setOldProfileImg] = useState(null);
  const { username: pageUsername } = useParams();
  const isProfileOwner = pageUsername === authData.username;
  if (!isProfileOwner) history.replace("/error");

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
    bioInput,
    setBioInput,
    bioInputChangeHandler,
    isBioValid,
    setIsBioVaild,
    checkBioValid,
    bioFocusHandler,
  ] = useInput();
  const [
    dobInput,
    setDobInput,
    dobInputChangeHandler,
    isDobValid,
    setIsDobVaild,
    checkDobValid,
    dobFocusHandler,
  ] = useInput();

  useEffect(() => {
    setIsLoading(true);
    console.log(profileImg);
    const getUserProfile = async () => {
      const [data, error] = await sendRequest({
        method: "GET",
        url: "/profile/" + authData.username,
        headers: {
          "Content-Type": "application/json",
          Authorization: authData.token,
        },
      });
      if (error) {
        return console.log(error);
      }
      setFnameInput(data.fname);
      setLnameInput(data.lname);
      setEmailInput(data.email);
      setUsernameInput(data.username);
      if (data.profileImg) setProfileImg(data.profileImg);
      if (data.dob) setDobInput(formatDate(data.dob));
      if (data.bio) setBioInput(data.bio);
      setIsLoading(false);
    };
    getUserProfile();
  }, [pageUsername]);

  const changeProfileImageHandler = () => {
    profileImgRef.current.click();
  };
  const changeHandler = async (event) => {
    setOldProfileImg(profileImg);
    const file = event.target.files;
    console.log(file[0]);
    setProfileImg(URL.createObjectURL(file[0]));
    setModalOpen(true);
  };

  const updateProfileImg = async (blob) => {
    // console.log(blob);
    const body = { newImage: blob };
    setIsProfileImgLoading(true);
    try {
      const [data, error] = await sendRequest({
        method: "POST",
        url: "/profile/img",
        body: body,
        headers: {
          "Content-Type": "application/json",
          Authorization: authData.token,
        },
      });
      if (error) {
        console.log(error.message);
        return;
      }
      console.log(data);
      setProfileImg(data.result.imageUrl);
      modalClose(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  const modalClose = (reset = true) => {
    // console.log(profileImgRef.current.value);
    profileImgRef.current.value = "";
    if (reset) {
      setProfileImg(oldProfileImg);
    }
    setModalOpen(false);
    setIsProfileImgLoading(false);
  };
  const imageSubmitHandler = (event) => {
    event.preventDefault();
    // console.log(event);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setIsFormSubmitLoading(true);
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
    if (!validateDob(dobInput)) {
      setIsDobVaild(false);
      isFormValid = false;
    }
    if (!isFormValid) {
      return;
    }
    const body = {
      fname: fnameInput,
      lname: lnameInput,
      email: emailInput,
      username: usernameInput,
      bio: bioInput,
      dob: dobInput,
    };
    console.log(body);
    const [data, error] = await sendRequest({
      method: "PUT",
      url: "/profile/edit",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: authData.token,
      },
    });
    console.log(data);
    history.push("/profile/" + usernameInput);
    setIsFormSubmitLoading(false);
  };
  return (
    <Fragment>
      {modalOpen && (
        <Fragment>
          <div className={`card ${classes["profile-edit-card"]}`}>
            {profileImg && (
              <ImageCropper
                image={profileImg}
                close={modalClose}
                update={updateProfileImg}
                loading={isProfileImgLoading}
              />
            )}
          </div>
          <div className={classes.backdrop} onClick={modalClose}></div>
        </Fragment>
      )}
      {isAlert && <Alert message={isAlert} />}
      {isLoading && <LoadingSpinner />}
      {!isLoading && (
        <div className={`${classes.card} ${classes["form-class"]}`}>
          <h2>Social Network</h2>
          <form onSubmit={imageSubmitHandler}>
            <input
              type="file"
              id="imgupload"
              className="hide"
              ref={profileImgRef}
              onChange={changeHandler}
              accept="image/*"
            />
          </form>
          <form onSubmit={submitHandler}>
            {/* Profile pic */}
            <div className={classes["profile-container"]}>
              <div
                className={`${classes["img-container"]} ${
                  isProfileImgLoading ? "hide" : ""
                }`}
                title="Change profile img"
                onClick={changeProfileImageHandler}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/camera-dark.png`}
                  className={classes["profile-img-overlay"]}
                />
                <img
                  src={profileImg}
                  alt="profile picture"
                  className={classes["profile-img"]}
                />
              </div>
              <button
                type="button"
                className={`${classes["profile-img-btn"]} ${
                  isProfileImgLoading ? "hide" : ""
                }`}
                onClick={changeProfileImageHandler}
              >
                Change profile image
              </button>
              {isProfileImgLoading && (
                <LoadingSpinner className={classes["loading"]} />
              )}
            </div>
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
            {/* <Input
                            title="Username*"
                            type='text'
                            id='username'
                            placeholder="john345"
                            isValid={isUsernameValid}
                            invalidMessage="Username should be more than 6 characters"
                            focus={usernameFocusHandler}
                            value={usernameInput}
                            change={usernameInputChangeHandler}
                        /> */}
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
            {/* Bio  */}
            <TextArea
              title="Bio"
              id="bio"
              placeholder="Describe yourself..."
              isValid={isBioValid}
              invalidMessage="no bio"
              focus={bioFocusHandler}
              value={bioInput}
              change={bioInputChangeHandler}
            />
            {/* Date of Birth */}
            <Input
              title="Date of Birth"
              type="date"
              id="date"
              placeholder=""
              isValid={isDobValid}
              invalidMessage="Enter valid date of birth"
              focus={dobFocusHandler}
              value={dobInput}
              change={dobInputChangeHandler}
            />
            {isFormSubmitLoading && (
              <div className="center">
                <LoadingSpinner />
              </div>
            )}
            {!isFormSubmitLoading && (
              <button className={classes.button}>Update Profile</button>
            )}
          </form>
        </div>
      )}
    </Fragment>
  );
};

export default EditProfilePage;
