import { Fragment, useState, useRef, useEffect } from "react";
import classes from "./HomePage.module.css";
import useInput from "../../hooks/use-input";
import Post from "../../Ui/Post";
import { useSelector } from "react-redux";
import sendRequest from "../../helper/sendRequest";
import { createPortal } from "react-dom";
import PostModal from "../../Ui/PostModal/PostModal";
import LoadingSpinner from "../../Ui/LoadingSpinner";
import { useLocation } from "react-router-dom";
import useScrollHomepage from "../../hooks/use-scroll-homepage";
import PageMessage from "../../Ui/page-message/PageMessage";
import useErrorHandler from "../../hooks/use-error-handler";

const HomePage = () => {
  const authData = useSelector((state) => state.auth);
  const scrollData = useSelector((state) => state.homepageScroll);
  const setScrollPos = useScrollHomepage();
  const [allPosts, setAllPosts] = useState([]);
  const [arePostsLoading, setArePostsLoading] = useState(false);
  const [likesCountArr, setLikesCountArr] = useState([]);
  const [commentsArr, setCommentsArr] = useState([]);
  const [activeTab, setActiveTab] = useState("post");
  const [postModalData, setPostModalData] = useState({});
  const [showPost, setShowPost] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [pageData, setPageData] = useState({
    pageNo: 1,
    totalPageCount: 1,
    allPagesLoaded: false,
  });
  const [pageLoaded, setPageLoaded] = useState({});
  const pageSize = 6;
  const postInputRef = useRef();
  const likeTimer = useRef(null);
  const location = useLocation();
  const handleError = useErrorHandler();

  const [postInputValue, setPostInputValue, postInputChangeHanlder] =
    useInput();
  const togglePostClass = activeTab === "post" ? classes["active"] : "";
  const togglePhotoClass = activeTab === "photo" ? classes["active"] : "";
  const photoIcon = `${process.env.PUBLIC_URL}/image-icon.png`;
  const togglePostHanlder = (postType) => {
    console.log(postType);
    if (postType === "post") {
      setActiveTab("post");
    } else {
      setActiveTab("photo");
    }
  };

  const postSubmitHandler = (event) => {
    event.preventDefault();
    const enteredPostInputValue = postInputValue;
    if (enteredPostInputValue) {
      console.log(enteredPostInputValue);
    }
  };

  // Function to handle the scroll event
  const handleScroll = () => {
    setScrollPos(window.scrollY);
  };

  //fetch placeholder image
  const placeholderImg = "/profile-pic-default.webp";
  useEffect(() => {
    const image = new Image();
    image.src = placeholderImg;

    // Add the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up by removing the event listener when the component unmounts
    return () => {
      //   console.log("scroll new " + scrollPosition);
      window.removeEventListener("scroll", handleScroll);
      // setScrollPos(window.pageYOffset);
    };
  }, []);

  // scroll to last scroll position
  useEffect(() => {
    setTimeout(() => {
      //   console.log("new scroll " + window);
      window.scrollTo({
        top: scrollData.scrollY,
        behavior: "instant", // Set the behavior to "instant" for instant scrolling
      });
    }, 100);
  }, []);

  //fetch posts
  const getAllPosts = async (newPageNo, newPageSize) => {
    if (!arePostsLoading) {
      setArePostsLoading(true);
      const [data, error] = await sendRequest({
        method: "GET",
        url: `/post/follow?pageNo=${newPageNo}&pageSize=${newPageSize}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: authData.token,
        },
      });
      if (error) {
        console.log(error);
        handleError(error);
        return;
      }
      // console.log("posts loaded");
      addPosts(data.posts);
      setPageData({
        pageNo: data.pageNo,
        totalPageCount: data.totalPageCount,
        allPagesLoaded: data.pageNo === data.totalPageCount,
      });
      setArePostsLoading(false);
    }
  };

  //Load more posts
  const loadMorePosts = () => {
    console.log("load more posts");
    const nextPageNo = pageData.pageNo + 1;
    console.log(
      "next Page no " + nextPageNo + ", total page:" + pageData.totalPageCount
    );
    if (!pageData.allPagesLoaded) {
      console.log("load more posts");
      getAllPosts(nextPageNo, pageSize);
    }
  };

  //detect scroll to bottom
  useEffect(() => {
    function handleScroll1() {
      // Calculate the height of the page content
      const scrollHeight = document.documentElement.scrollHeight;
      // Calculate the height of the visible portion of the page
      const clientHeight = document.documentElement.clientHeight + 2; // +2 for compensating deviation
      // Calculate the current scroll position
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // console.log(scrollHeight - scrollTop, clientHeight);
      // Check if the user has scrolled to the bottom of the page
      if (scrollHeight - scrollTop < clientHeight) {
        // Perform your action here, such as loading more content
        console.log("End of page reached!");
        loadMorePosts();
      }
    }

    // Attach the scroll event listener to the window object
    window.addEventListener("scroll", handleScroll1);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("scroll", handleScroll1);
    };
  }, [arePostsLoading]); // Run this effect only once after the component mounts

  const addPosts = (posts) => {
    setAllPosts((prevState) => [...prevState, ...posts]);
    setLikesCountArr((prevState) => {
      return [
        ...prevState,
        ...posts.map((el) => ({
          likesCount: el.likesCount,
          isPostLiked: el.isPostLiked,
        })),
      ];
    });
    setCommentsArr((prevState) => {
      return [
        ...prevState,
        ...posts.map((el) => ({
          comments: [...el.comment],
          commentsCount: el.commentsCount,
        })),
      ];
    });
  };

  // get post feed
  useEffect(() => {
    // setArePostsLoading(true);
    getAllPosts(1, pageSize);
    // (async () => {
    //   if (location.pathname === "/") {
    //     getAllPosts(1, pageSize);
    //     console.log(arePostsLoading);
    //     if (!arePostsLoading) {
    //       // getAllPosts(1, pageSize);
    //     }
    //   }
    // })();
  }, []);
  // }, [location]);

  //like button handler
  const likeBtnHandler = async (postId, isPostLiked, likesCount, index) => {
    let path;
    let newLikeStatus;
    if (isPostLiked) {
      newLikeStatus = false;
      path = "/unlike";
      likesCount--;
    } else {
      newLikeStatus = true;
      path = "/like";
      likesCount++;
    }
    clearTimeout(likeTimer.current);
    likeTimer.current = setTimeout(async () => {
      const [likeData, error] = await sendRequest({
        method: "GET",
        url: "/post/" + postId + path,
        headers: {
          "Content-Type": "application/json",
          Authorization: authData.token,
        },
      });
      if (error) {
        console.log(error);
        handleError(error);
      }
      // console.log(likeData);
      console.log("scroll y " + window.pageYOffset);
    }, 1000);
    // setPostModalData(prevState => ({ ...prevState, postLiked: newLikeStatus, likesCount }));
    setLikesCountArr((prevState) => {
      prevState[index] = { likesCount, isPostLiked: newLikeStatus };
      return [...prevState];
    });
  };

  //open post modal
  const openPostModal = (idx) => {
    const clickedPost = allPosts[idx];
    const newPostModalData = {
      name: `${clickedPost.user.fname} ${clickedPost.user.lname}`,
      text: clickedPost.text,
      photo: clickedPost.photo,
      postId: clickedPost._id,
      comments: commentsArr[idx].comments,
      createdAt: clickedPost.createdAt,
      postLiked: clickedPost.isPostLiked,
      commentsLoading: false,
      likesCount: clickedPost.likesCount,
      postIndex: idx,
    };
    console.log(newPostModalData);
    setPostModalData(newPostModalData);
    setShowPost(true);
  };

  // close post modal
  const closePostModal = () => {
    setShowPost(false);
  };

  // add comment
  const addNewCommentHandler = (commentData, postIndex) => {
    // update post modal and user posts state for new comment
    setCommentsArr((prevState) => {
      let newCommentsArr = [...prevState];
      newCommentsArr[postIndex].comments.unshift(commentData);
      newCommentsArr[postIndex].commentsCount =
        newCommentsArr[postIndex].commentsCount + 1;
      return newCommentsArr;
    });
    // console.log(newCommentsArr);
    console.log(postModalData);
    console.log(commentsArr);
    setPostModalData((prevState) => ({
      ...prevState,
      comments: [...commentsArr[postIndex].comments],
    }));
  };

  const postForm = (
    <form onSubmit={postSubmitHandler}>
      <div className="mb-3">
        <textarea
          className="form-control"
          id="exampleFormControlTextarea1"
          rows="3"
          placeholder="What's on your mind?"
          ref={postInputRef}
          value={postInputValue}
          onChange={postInputChangeHanlder}
        ></textarea>
      </div>
      <div className="d-grid gap-2">
        <button
          className="btn btn-primary"
          disabled={postInputValue.length <= 0}
        >
          Post
        </button>
      </div>
    </form>
  );

  return (
    <Fragment>
      {/* Post modal  */}
      {showPost &&
        createPortal(
          <PostModal
            close={closePostModal}
            data={postModalData}
            likeBtnClick={likeBtnHandler}
            commentSubmit={addNewCommentHandler}
            isOwner={false}
          />,
          document.getElementById("modal-root")
        )}
      {allPosts.map((post, idx) => (
        <Post
          key={post._id}
          postId={post._id}
          index={idx}
          text={post.text}
          photo={post.photo}
          fname={post.user.fname}
          lname={post.user.lname}
          username={post.user.username}
          likesCount={likesCountArr[idx].likesCount}
          commentsCount={commentsArr[idx].commentsCount}
          profileImg={post.user.profileImg || placeholderImg}
          createdAt={post.createdAt}
          onLikeClick={likeBtnHandler}
          isPostLiked={likesCountArr[idx].isPostLiked}
          comments={post.comment}
          onCommentsClick={openPostModal}
        />
      ))}
      {!pageData.allPagesLoaded && (
        <div style={{ height: "36px" }}>
          {arePostsLoading && (
            <div className="center">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
      {!arePostsLoading && allPosts.length <= 0 && (
        <PageMessage
          title="Follow People"
          body="When you follow people, their posts will appear on your home feed"
          showImg="plus"
          url="/find-friends"
          btnText="Find friends"
          mt={200}
        />
      )}
    </Fragment>
  );
};

export default HomePage;
