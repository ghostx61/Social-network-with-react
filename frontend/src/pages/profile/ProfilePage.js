import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import classes from './ProfilePage.module.css';
import sendRequest from '../../helper/sendRequest';

import LoadingSpinner from '../../Ui/LoadingSpinner';
import { formatDate2 } from '../../helper/dataTransform';
import Post from '../../Ui/Post';
import Modal from '../../Ui/Modal';
import PostModal from '../../Ui/PostModal/PostModal';

const ProfilePage = () => {
    const authData = useSelector(state => state.auth);
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [showPost, setShowPost] = useState(false);
    const [postModalData, setPostModalData] = useState({});
    const { username: pageUsername } = useParams();
    const isProfileOwner = (pageUsername === authData.username);
    // console.log(currUsername);
    const likeTimer = useRef(null);
    useEffect(() => {
        setIsLoading(true);
        const getUserProfile = async () => {
            const [data, error] = await sendRequest({
                method: 'GET',
                url: '/profile/' + pageUsername + '?posts=true',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authData.token
                }
            });
            if (error) {
                console.log(error);
                history.replace('/error');
                return;
            }
            data.createdAt = formatDate2(data.createdAt);
            if (data.dob) data.dob = formatDate2(data.dob);
            setUser(data);
            setUserPosts(data.post)
            console.log(data);
            setIsLoading(false);
        }
        getUserProfile();
    }, [pageUsername])

    const getPostCommentsHandler = async (postId) => {
        console.log('get comment');
        const [commentData, error] = await sendRequest({
            method: 'GET',
            url: '/comment/post/' + postId,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            }
        });
        if (error) {
            return console.log(error);
        }
        console.log(commentData);
        return await commentData;
    }

    const openPostHandler = (idx) => {
        const clickedPost = userPosts[idx];
        const clickedPostId = clickedPost._id;
        // console.log(clickedPost);
        const newData = {
            name: `${user.fname} ${user.lname}`,
            text: clickedPost.text,
            photo: clickedPost.photo,
            userImage: null,
            postId: clickedPostId,
            createdAt: clickedPost.createdAt,
            commentsLoading: false,
            comments: [],
            postLiked: clickedPost.postLiked,
            likesCount: clickedPost.likesCount
        }
        if (clickedPost['comments'] === undefined) {
            // console.log('add comments');
            newData.commentsLoading = true;
            getPostCommentsHandler(clickedPostId).then(comments => {
                // console.log('comments fetched');
                setPostModalData({ ...newData, commentsLoading: false, comments: comments });
                setUserPosts(preState => (
                    preState.map(el => el._id == clickedPostId ? { ...el, comments: comments } : el)
                ));
            })
        } else {
            // console.log('comment already exists');
            newData.comments = clickedPost.comments;
        }
        console.log(idx);
        setPostModalData(newData);
        setShowPost(true);
    }
    const closePostModal = () => {
        setShowPost(false);
    }

    const likeBtnHandler = async (postId, isPostLiked, likesCount) => {
        console.log('like 1 ' + postId, isPostLiked);
        let path;
        let newLikeStatus;
        if (isPostLiked) {
            newLikeStatus = false;
            path = '/unlike';
            likesCount--;
        } else {
            newLikeStatus = true;
            path = '/like';
            likesCount++;
        }
        clearTimeout(likeTimer.current);
        likeTimer.current = setTimeout(async () => {
            const [likeData, error] = await sendRequest({
                method: 'GET',
                url: '/post/' + postId + path,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authData.token
                }
            });
            if (error) {
                return console.log(error);
            }
            console.log(likeData);
        }, 1000);
        setPostModalData(prevState => ({ ...prevState, postLiked: newLikeStatus, likesCount }));
        setUserPosts(prevState => (
            prevState.map(el => el._id == postId ? { ...el, postLiked: newLikeStatus, likesCount } : el)
        ))
    }

    const addNewCommentHandler = (commentData) => {
        // update post modal and user posts state for new comment
        // console.log(commentData);
        let updatedCommentList;
        setPostModalData(prevState => {
            updatedCommentList = [commentData, ...prevState.comments]
            return { ...prevState, comments: updatedCommentList }
        });
        setUserPosts(preState => (
            preState.map(el => el._id == commentData.post ? { ...el, comments: updatedCommentList } : el)
        ));
    }

    return (
        <Fragment>
            {/* <Modal title='testt'>
                <Post />
            </Modal> */}
            {showPost && createPortal(<PostModal close={closePostModal} data={postModalData} likeBtnClick={likeBtnHandler} commentSubmit={addNewCommentHandler} />, document.getElementById('modal-root'))}
            {isLoading && <div className='center'>
                <LoadingSpinner />
            </div>}
            {!isLoading && <div className={classes['profile']}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" className={classes['profile-img']} />
                <div className={`card ${classes['profile-container']}`}>
                    <div className={classes['edit-btn-container']}>
                        {isProfileOwner && <Link to={`/profile/${pageUsername}/edit`} className={`btn btn-primary ${classes['edit-btn']}`}>Edit Profile</Link>}
                    </div>
                    <div className={`card-body ${classes['profile-content']}`}>
                        <h5 className="card-title">{user.fname} {user.lname}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">{user.username}</h6>
                        {user.bio && <p>{user.bio}</p>}
                        {user.dob && <div className={classes['birthday']}>
                            <img src="https://img.icons8.com/sf-black-filled/64/null/birthday.png" />
                            <p>{user.dob}</p>
                        </div>}
                        <p className={classes['join-date']}>Joined on {user.createdAt}</p>
                    </div>
                </div>
            </div>}
            {/* <Post /> */}
            <div className={classes['posts-grid']}>
                {
                    userPosts.map((postItem, index) => {
                        return (
                            <div className={classes['post-item']} key={index} onClick={openPostHandler.bind(this, index)}>
                                <img src={postItem.photo} alt="Post" />
                            </div>
                        );
                    })
                }
            </div>
        </Fragment>
    );
}


export default ProfilePage;