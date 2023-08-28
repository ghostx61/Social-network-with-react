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
import TopModal from '../../Ui/TopModal/TopModal';
import useAuth from '../../hooks/use-Auth';
import FollowButton from '../../Ui/buttons/follow-button/FollowButton';
import PageMessage from '../../Ui/page-message/PageMessage';
import useModal from '../../hooks/use-modal';
import useErrorHandler from '../../hooks/use-error-handler';

const ProfilePage = () => {
    const authData = useSelector(state => state.auth);
    const renderComponent = useSelector(state => state.render.renderProfilePage);
    const toggleModal = useModal();
    const auth = useAuth();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowBtnLoading, setIsFollowBtnLoading] = useState(false);
    const [user, setUser] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [showPost, setShowPost] = useState(false);
    const [postModalData, setPostModalData] = useState({});
    const [deleteProfileModal, setDeleteProfileModal] = useState({ isOpen: false, isLoading: false });
    const { username: pageUsername } = useParams();
    const placeholderImg = '/profile-pic-default.webp';
    const isProfileOwner = (pageUsername === authData.username);
    const handleError = useErrorHandler();
    // console.log(currUsername);
    // console.log('profile page render')
    // console.log(renderComponent)
    const likeTimer = useRef(null);
    useEffect(() => {
        console.log('send profile request')
        setIsLoading(true);
        const getUserProfile = async () => {
            const [data, error] = await sendRequest({
                method: 'GET',
                url: '/profile/' + pageUsername + '?posts=true&followCount=true',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authData.token
                }
            });
            if (error) {
                console.log(error);
                handleError(error);
            }
            data.createdAt = formatDate2(data.createdAt);
            if (data.dob) data.dob = formatDate2(data.dob);
            setUser(data);
            setUserPosts(data.post)
            console.log(data);
            setIsLoading(false);
        }
        getUserProfile();
    }, [pageUsername, renderComponent])

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
            console.log(error);
            handleError(error);
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
            profileImg: user.profileImg,
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
                console.log(error);
                handleError(error);
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

    const deletePostHandler = (postId) => {
        console.log('delete from profile ' + postId);
        setUserPosts(prevState => prevState.filter(el => el._id != postId));
    }

    // delete profile hanlders
    const openDeleteProfileModal = () => {
        setDeleteProfileModal(prevState => ({ ...prevState, isOpen: true }));
    }
    const closeDeleteProfileModal = () => {
        setDeleteProfileModal(prevState => ({ ...prevState, isOpen: false }));
    }
    const profileDeleteHandler = async () => {
        console.log('profile delete');
        setDeleteProfileModal(prevState => ({ ...prevState, isLoading: true }));
        //delete from DB
        const [deleteData, error] = await sendRequest({
            method: 'DELETE',
            url: '/profile',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            }
        });
        if (error) {
            console.log(error);
            handleError(error);
        }
        //logout user
        auth.userLogout();
    }

    // on click follow
    const followHandler = async (followerId, followState) => {
        // console.log('follow' + followerId);

        //setup varibales for based on followState
        setIsFollowBtnLoading(true);
        const isFollowing = followState === 'follow';
        const body = isFollowing ?
            { followingUserId: followerId } :
            { unfollowingUserId: followerId };

        // update to DB
        const [data, error] = await sendRequest({
            method: 'POST',
            url: '/user/' + followState,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            },
            body
        });
        if (error) {
            console.log(error);
            handleError(error);
        }
        // change follow status locally
        setUser(prevState => ({ ...prevState, isFollowing, followingCount: isFollowing ? prevState.followingCount + 1 : prevState.followingCount - 1 }));
        setIsFollowBtnLoading(false);
    }

    const openUploadPostModal = () => {
        toggleModal.openModal('post');
    }

    return (
        <Fragment>
            {/* delete profile modal  */}
            {deleteProfileModal.isOpen && createPortal(
                <TopModal
                    title='Delete Profile'
                    bodyCopy="Are you sure you want to delete your profile? You wont be able to recover it later"
                    buttonClickHandler={profileDeleteHandler}
                    buttonLoading={deleteProfileModal.isLoading}
                    closeModal={closeDeleteProfileModal}
                />,
                document.getElementById('modal-root-top'))}
            {/* Post modal  */}
            {showPost && createPortal(
                <PostModal
                    close={closePostModal}
                    data={postModalData}
                    likeBtnClick={likeBtnHandler}
                    isOwner={isProfileOwner}
                    deletePost={deletePostHandler}
                    commentSubmit={addNewCommentHandler} />,
                document.getElementById('modal-root'))}
            {isLoading && <div className='center'>
                <LoadingSpinner />
            </div>}
            {!isLoading && <div className={classes['profile']}>
                <img src={user.profileImg || placeholderImg} className={classes['profile-img']} />
                <div className={`card ${classes['profile-container']}`}>
                    <div className={classes['edit-btn-container']}>
                        {isProfileOwner && <div className={`btn btn-outline-danger ${classes['delete-btn']}`} onClick={openDeleteProfileModal}>Delete Profile</div>}
                        {isProfileOwner && <Link to={`/profile/${pageUsername}/edit`} className={`btn btn-primary ${classes['edit-btn']}`}>Edit Profile</Link>}
                        {!isProfileOwner && <FollowButton isFollowing={user.isFollowing} onFollow={followHandler} userId={user._id} addClass='profilePage' isLoading={isFollowBtnLoading} />}
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
                        <div className={classes['profile-stats']}>
                            <div className={classes['stat-item']}>
                                <p className={classes['stat-no']}>{userPosts.length}</p>
                                <p className={classes['stat-name']}>Posts</p>
                            </div>
                            <div className={classes['stat-item']}>
                                <p className={classes['stat-no']}>{user.followingCount}</p>
                                <p className={classes['stat-name']}>Following</p>
                            </div>
                            <div className={classes['stat-item']}>
                                <p className={classes['stat-no']}>{user.followerCount}</p>
                                <p className={classes['stat-name']}>Followers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            {/* <Post /> */}
            {!isLoading && <div className={classes['posts-grid']}>
                {
                    userPosts.map((postItem, index) => {
                        return (
                            <div className={classes['post-item']} key={index} onClick={openPostHandler.bind(this, index)}>
                                <img src={postItem.photo} alt="Post" />
                            </div>
                        );
                    })
                }
            </div>}
            {
                !isLoading && userPosts.length <= 0 &&
                <PageMessage
                    title='Post your photos'
                    body="When you post photos, they will appear on your profile."
                    url=''
                    btnText='Upload photo'
                    mt={15}
                    showImg='user'
                    onClickFtn={openUploadPostModal}
                />
            }
        </Fragment>
    );
}


export default ProfilePage;