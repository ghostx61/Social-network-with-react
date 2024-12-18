import { Fragment, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import sendRequest from "../helper/sendRequest";
import useAuth from "../hooks/use-Auth";
import useRender from "../hooks/use-render";
import Modal from "../Ui/Modal";

import classes from "./Navbar.module.css";
import LoadingSpinner from "./LoadingSpinner";
import useModal from "../hooks/use-modal";
import useGlobalData from "../hooks/use-global-data";

const Navbar = (props) => {
  const authData = useSelector((state) => state.auth);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector((state) => state.auth.role === "admin");
  const history = useHistory();
  const { setProfileImg } = useGlobalData();

  //post modal
  const isPostModalOpen = useSelector((state) => state.modal.isPostModalOpen);
  const toggleModal = useModal();

  const [navDropdownActive, setNavDropdownActive] = useState(false);
  // const [showPostModal, setShowPostModal] = useState(false);
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadImageFile, setUploadImageFile] = useState(null);
  const { userLogout } = useAuth();
  const renderComponent = useRender();
  const uploadImageRef = useRef();
  const postTextInputRef = useRef();
  const [postTextInput, setPostTextInput] = useState("");
  const [postBtnEnable, setPostBtnEnable] = useState(false);
  const [isPostUploading, setIsPostUploading] = useState(false);
  // const [profileImg, setProfileImg] = useState("/profile-pic-default.webp");
  const profileImg = useSelector((state) => state.globalData.profileImg);
  const [screenView, setScreenView] = useState("desktop");
  const username = authData.username;
  // console.log(authData);
  // console.log('navbar render');
  useEffect(() => {
    if (uploadImage) {
      setPostBtnEnable(true);
    } else {
      setPostBtnEnable(false);
    }
  }, [postTextInput, uploadImage]);

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

  useEffect(() => {
    const getUserData = async () => {
      // console.log(authData.token);
      try {
        const [data, error] = await sendRequest({
          method: "GET",
          url: `/profile/${username}?select=profileImg`,
          headers: {
            "Content-Type": "application/json",
            Authorization: authData.token,
          },
        });
        if (error) {
          console.log(error.message);
          return;
        }
        // console.log(data);
        setProfileImg(data.profileImg || "/profile-pic-default.webp");
      } catch (e) {
        // setProfileImg('/profile-pic-default.webp');
        console.log(e.message);
      }
    };
    if (username && screenView === "desktop") {
      getUserData();
    }
  }, [authData]);

  const dropdownHandler = () => {
    setNavDropdownActive((state) => !state);
  };
  const logoutHandler = () => {
    userLogout();
    setNavDropdownActive(false);
  };
  const dropdownClickHandler = () => {
    setNavDropdownActive(false);
  };
  const showPostModalHandler = () => {
    // setShowPostModal(true);
    toggleModal.openModal("post");
  };
  const hidePostModalHandler = () => {
    // setShowPostModal(false);
    toggleModal.closeModal("post");
    setPostTextInput("");
    removeImageHandler();
  };

  const addImageHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      // console.log(event.target.value);
      // console.log(event.target.files);
      setUploadImageFile(event.target.files[0]);
      setUploadImage(URL.createObjectURL(event.target.files[0]));
      // postCheckHandler();
    }
  };
  const removeImageHandler = () => {
    setUploadImage(null);
    setUploadImageFile(null);
    uploadImageRef.current.value = "";
    // postCheckHandler();
  };
  const postTextChangeHandler = (event) => {
    setPostTextInput(event.target.value);
    // postCheckHandler();
  };
  // const postCheckHandler = () => {
  //     const enteredText = postTextInput;
  //     const uploadedPhoto = uploadImage;
  //     console.log(enteredText.length  )
  //     if (enteredText.length > 0 || uploadedPhoto) {
  //         setPostBtnEnable(true);
  //     } else {
  //         setPostBtnEnable(false);
  //     }
  // }
  const postSubmitHandler = async (event) => {
    setIsPostUploading(true);
    event.preventDefault();
    const enteredText = postTextInput;
    const uploadedPhoto = uploadImageFile;
    // console.log(enteredText, uploadedPhoto);
    if (postBtnEnable) {
      const body = new FormData();
      body.append("photo1", uploadedPhoto);
      body.append("text", enteredText);
      // const body = {
      //     text: enteredText,
      //     photo: uploadedPhoto
      // }
      //send data
      try {
        const [data, error] = await sendRequest({
          method: "POST",
          url: "/post/new",
          body: body,
          noJson: true,
          headers: {
            // 'Content-Type': 'application/json',
            Authorization: authData.token,
          },
        });
        if (error) {
          console.log(error.message);
          return;
        }
        // console.log(data);
        // setProfileImg(data.result.secure_url);
        hidePostModalHandler();
        renderComponent("profilePage");
        history.push("/profile/" + authData.username);
        setIsPostUploading(false);
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  const userNavLinks = (
    <Fragment>
      <li className={classes["nav-link"]}>
        <NavLink to="/" activeClassName={classes["nav-link-active"]} exact>
          Home
        </NavLink>
      </li>
      <li className={classes["nav-link"]}>
        <NavLink
          to="/find-friends"
          activeClassName={classes["nav-link-active"]}
          exact
        >
          Find friends
        </NavLink>
      </li>
      <li className={classes["nav-link"]}>
        <p className={classes["create-link"]} onClick={showPostModalHandler}>
          Create
        </p>
      </li>
    </Fragment>
  );

  const adminNavLinks = (
    <Fragment>
      <li className={classes["nav-link"]}>
        <NavLink to="/admin" activeClassName={classes["nav-link-active"]} exact>
          Dashboard
        </NavLink>
      </li>
    </Fragment>
  );

  const postModalContainer = (
    <Modal title="Create post" close={hidePostModalHandler}>
      <form onSubmit={postSubmitHandler}>
        <div className={classes["modal-container"]}>
          <div className="mb-3">
            <textarea
              className="form-control"
              id={classes.postTextArea}
              rows="4"
              ref={postTextInputRef}
              value={postTextInput}
              onChange={postTextChangeHandler}
              maxLength="200"
              placeholder="Write something about your post..."
            ></textarea>
          </div>
          {!uploadImage && (
            <label
              htmlFor={classes["upload-input"]}
              className={classes["upload-label"]}
            >
              <div className={`card ${classes["upload-card"]}`}>
                <p>Add photo</p>
              </div>
            </label>
          )}
          {uploadImage && (
            <div
              className={`card ${classes["preview-image-container"]}`}
              onClick={removeImageHandler}
            >
              <div className={classes["img-close-btn"]}>
                <button type="button" className="btn-close"></button>
              </div>
              <img src={uploadImage} alt="preview" />
            </div>
          )}
          <input
            type="file"
            name="photo1"
            accept="image/png, image/gif, image/jpeg"
            id={classes["upload-input"]}
            onChange={addImageHandler}
            ref={uploadImageRef}
          />
        </div>
        {!isPostUploading && (
          <div className={`d-grid gap-2 ${classes["post-btn-container"]}`}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!postBtnEnable}
            >
              Post
            </button>
          </div>
        )}
        {isPostUploading && (
          <div className={classes["spinner-container"]}>
            <LoadingSpinner />
          </div>
        )}
      </form>
    </Modal>
  );

  return (
    <Fragment>
      {isPostModalOpen &&
        createPortal(postModalContainer, document.getElementById("modal-root"))}
      <nav className={classes["navbar-new"]}>
        <ul>
          <li className={classes["nav-logo"]}>
            <Link to="/">
              <img src={`${process.env.PUBLIC_URL}/camera.png`} /> Social
              Network
            </Link>
          </li>
          {isAuth && !isAdmin && screenView === "desktop" && userNavLinks}
          {isAuth && isAdmin && screenView === "desktop" && adminNavLinks}
        </ul>
        {isAuth && screenView === "desktop" && (
          <ul className={classes["nav-right"]}>
            {/* <li>
                            <input type="text" placeholder="Search" className={classes['nav-search']} />
                        </li> */}
            <li className={classes["profile-img"]} onClick={dropdownHandler}>
              {/* <Link to="/"> */}
              <img src={profileImg} />
              {/* </Link> */}
            </li>
          </ul>
        )}
        {/* Mobile view  */}
        {isAuth && !isAdmin && screenView === "mobile" && (
          <ul className={classes["nav-right"]}>
            {/* <li>
                            <input type="text" placeholder="Search" className={classes['nav-search']} />
                        </li> */}
            <li
              className={classes["mobile-settings"]}
              onClick={dropdownHandler}
            >
              {/* <Link to="/"> */}
              <img src="/settings-white.svg" alt="settings menu" />
              {/* <img src='/dropdown-white.png' alt="settings menu" /> */}
              {/* </Link> */}
            </li>
          </ul>
        )}
        {navDropdownActive && (
          <Fragment>
            <div
              className={classes["overlay"]}
              onClick={dropdownClickHandler}
            ></div>
            <div className={`card ${classes["nav-dropdown"]}`}>
              <ul
                className="list-group list-group-flush"
                onClick={dropdownClickHandler}
              >
                <li
                  className={`list-group-item ${classes["nav-dropdown-item"]}`}
                >
                  <Link to={`/profile/${username}`}>{username}</Link>
                </li>
                {/* <li className={`list-group-item ${classes['nav-dropdown-item']}`}>
                            <Link to={`/profile/sagar123/edit`}>edit</Link>
                        </li> */}
                <li
                  className={`list-group-item ${classes["nav-dropdown-item"]}`}
                  onClick={logoutHandler}
                >
                  Logout
                </li>
                {/* <li className="list-group-item">A third item</li> */}
              </ul>
            </div>
          </Fragment>
        )}
      </nav>
    </Fragment>
  );
};

export default Navbar;
