import { Fragment, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import CommentButton from "../buttons/commentBtn/CommentButton";
import LikeButton from "../buttons/likeBtn/LikeButton";
import LoadingSpinner from "../LoadingSpinner";
import classes from './PostModal.module.css';
import sendRequest from '../../helper/sendRequest';
import { formatDate3, formatDate4 } from '../../helper/dataTransform';
import { createPortal } from "react-dom";
import TopModal from "../TopModal/TopModal";

const PostModal = (props) => {
    const menuSvg = <svg height="23px" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z" /></svg>
    const dropdownSvg = <svg height="23px" viewBox="0 0 320 512"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" /></svg>
    // const deleteSvg = <svg height="23px" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
    const authData = useSelector(state => state.auth);
    const limit = '100';
    const commentInputRef = useRef();
    const [isPostSubmitting, setIsPostSubmitting] = useState(false);
    const [deletePostModal, setDeletePostModal] = useState({ isOpen: false, isLoading: false });
    const textareaHeightHandler = (e) => {
        e.target.style.height = 'inherit';
        console.log(e.target.scrollHeight);
        // e.target.style.height = `${e.target.scrollHeight}px`;
        //for limit
        e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`;
    }
    const closePostHandler = () => {
        props.close();
    }
    console.log(props);
    const {
        name,
        text,
        photo,
        postId,
        comments,
        createdAt,
        postLiked,
        commentsLoading,
        likesCount,
        postIndex = -1
    } = props.data;


    const openDeleteModal = () => {
        setDeletePostModal(prevState => ({ ...prevState, isOpen: true }))
    }

    const closeDeleteModalHandler = () => {
        setDeletePostModal(prevState => ({ isLoading: false, isOpen: false }));
    }
    const deletePostHandler = async () => {
        // console.log('deleted post');
        setDeletePostModal(prevState => ({ ...prevState, isLoading: true }))
        const [data, error] = await sendRequest({
            method: 'DELETE',
            url: '/post/' + postId,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            }
        });
        if (error) {
            console.log(error);
            return;
        }
        closeDeleteModalHandler();
        setDeletePostModal(prevState => ({ ...prevState, isLoading: false }))
        closePostHandler();
        props.deletePost(postId);
    }

    const deleteSvg = <svg height="23px" viewBox="0 0 448 512" className={classes['delete-btn']} onClick={openDeleteModal}><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></svg>


    const commentSubmitHandler = async (event) => {
        event.preventDefault();
        setIsPostSubmitting(true);
        const commentText = commentInputRef.current.value;
        const body = {
            postId,
            text: commentText
        }
        //save comment 
        const [data, error] = await sendRequest({
            method: 'POST',
            url: '/comment',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            },
            body
        });
        if (error) {
            return console.log(error);
        }
        console.log(data);
        props.commentSubmit(data.comment, postIndex);
        setIsPostSubmitting(false);
        //clear textarea
        commentInputRef.current.value = '';
    }



    return (
        <Fragment>
            {deletePostModal.isOpen && createPortal(
                <TopModal
                    title='Delete Post'
                    bodyCopy="Are you sure you want to delete this post?"
                    buttonClickHandler={deletePostHandler}
                    buttonLoading={deletePostModal.isLoading}
                    closeModal={closeDeleteModalHandler}
                />,
                document.getElementById('modal-root-top'))}
            <div className={classes.backdrop} onClick={closePostHandler}></div>
            <div className={`${classes['post-modal']}`}>
                <div className={classes['post-container']}>
                    <div className={classes['post-left-section']}>
                        <img className={classes['post-image']} src={photo} />
                    </div>
                    <div className={classes['post-right-section']}>
                        <div className={classes['post-right-container']}>
                            <div className={classes['post-right-header-container']}>
                                <div className={classes['post-right-header']}>
                                    <img className={classes['post-user-image']} src={props.data.profileImg || "/profile-pic-default.webp"} />
                                    <p className={classes['post-username']}>{name || 'null'}</p>
                                    <button type="button" className={`btn-close ${classes['close-btn']}`} aria-label="Close" onClick={closePostHandler}></button>
                                </div>
                                <p className={classes['post-text']}>{text}</p>
                            </div>
                            <hr className={classes['hr-line']} />
                            <div className={classes['comments-container']}>
                                {commentsLoading && <LoadingSpinner />}
                                {
                                    !commentsLoading &&
                                    comments.map(el => (
                                        <div className={classes['comment']} key={el._id}>
                                            <p className={classes['comment-text']}><span className={classes['comment-username']}>{el.author.name} </span>{el.text}</p>
                                            <p className={classes['comment-time']}>{formatDate4(el.createdAt)}</p>
                                        </div>
                                    ))
                                }
                            </div>
                            <hr className={classes['hr-line']} />
                            <div className={classes['post-details-container']}>
                                <div className={classes['reactions-btn']}>
                                    {<LikeButton count={likesCount} likeBtnClick={props.likeBtnClick.bind(this, postId, postLiked, likesCount)} isLiked={postLiked} />}
                                    {<CommentButton count={comments.length} />}
                                    {props.isOwner && deleteSvg}
                                </div>
                                <p className={classes['post-date']}>{formatDate3(createdAt)}</p>
                            </div>
                            <hr className={classes['hr-line']} />
                            <form onSubmit={commentSubmitHandler}>
                                <div className={classes['add-comment-container']}>
                                    <textarea type="text" name="" id="" onChange={textareaHeightHandler} rows='1' placeholder='add a comment' className={classes['comment-textarea']} ref={commentInputRef} disabled={isPostSubmitting}></textarea>
                                    <div className={classes['post-btn-container']}>
                                        <button className={`btn btn-outline-primary ${classes['post-btn']}`} type="submit" disabled={isPostSubmitting}>Post</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default PostModal;