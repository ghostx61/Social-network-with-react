import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { formatDate2, formatDate5 } from '../helper/dataTransform';
import CommentButton from './buttons/commentBtn/CommentButton';
import LikeButton from './buttons/likeBtn/LikeButton';
import classes from './Post.module.css';

const Post = (props) => {
    const limit = 1;
    const likeSvg = <svg height="23px" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>;
    const commentSvg = <svg height="23px" viewBox="0 0 512 512"><path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z" /></svg>;
    return (
        // <Fragment>
        <div className={`card ${classes['post-card']}`}>
            <div className={`card-body ${classes['card-top']}`}>
                <Link to={`/profile/${props.username}`}>
                    <img src={props.profileImg} alt="Post" className={classes['profile-pic']} />
                </Link>
                <div className={classes['card-top-right']}>
                    <Link to={`/profile/${props.username}`}>
                        <p className={classes['username']}>{`${props.fname} ${props.lname}`}</p>
                    </Link>
                    <p className={classes['post-date']}>{formatDate2(props.createdAt)}</p>
                </div>
            </div>
            {/* <p>Test ing the feature</p> */}
            <img src={props.photo} alt="Post" />
            <div className={`card-body ${classes['card-bottom']}`}>
                {/* <span className={classes['like-btn']} onClick={props.onLikeClick.bind(this, props.postId, props.isPostLiked, props.likesCount, props.index)}>
                    {likeSvg} {props.likesCount}
                </span> */}
                <LikeButton count={props.likesCount} likeBtnClick={props.onLikeClick.bind(this, props.postId, props.isPostLiked, props.likesCount, props.index)} isLiked={props.isPostLiked} />
                <CommentButton count={props.commentsCount} />
                {/* <span>
                    {commentSvg} {props.commentsCount}
                </span> */}
                <p className={classes['post-text']}>
                    {props.text}
                </p>
                {/* <hr /> */}
                {/* <div>
                    <span className={classes['comment-username']}>randomguy</span> <span className={classes['comment-text']}>Lorem ipsum dolor sit amet consectetur</span>
                </div>
                <div>
                    <span className={classes['comment-username']}>iron man</span> <span className={classes['comment-text']}>consectetur adipisicing elit. Harum obcaecati ipsum sint dignissimos similique! Vitae.
                    </span>
                </div> */}
                {props.comments.slice(0, limit).map(el => (
                    <div key={el._id}>
                        <span className={classes['comment-username']}>{el.author.username}</span> <span className={classes['comment-text']}>{el.text}</span>
                    </div>
                ))
                }
                <p className={classes['view-more-comments']} onClick={props.onCommentsClick.bind(this, props.index)}>view all comments</p>
                {/* <p>3,022 likes</p> */}
            </div>
        </div >
        // </Fragment>
    )
}

export default Post;