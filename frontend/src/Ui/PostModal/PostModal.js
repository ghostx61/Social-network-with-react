import { Fragment, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import CommentButton from "../buttons/commentBtn/CommentButton";
import LikeButton from "../buttons/likeBtn/LikeButton";
import LoadingSpinner from "../LoadingSpinner";
import classes from './PostModal.module.css';
import sendRequest from '../../helper/sendRequest';
import { formatDate3, formatDate4 } from '../../helper/dataTransform';

const PostModal = (props) => {
    const authData = useSelector(state => state.auth);
    const limit = '100';
    const commentInputRef = useRef();
    const [isPostSubmitting, setIsPostSubmitting] = useState(false);
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
        commentSubmit,
        likesCount
    } = props.data;


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
        props.commentSubmit(data.comment);
        setIsPostSubmitting(false);
        //clear textarea
        commentInputRef.current.value = '';
    }

    return (
        <Fragment>
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
                                    <img className={classes['post-user-image']} src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" />
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