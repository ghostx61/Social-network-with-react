import classes from './UserFollowCard.module.css';
import LoadingSpinner from '../../Ui/LoadingSpinner';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import FollowButton from '../buttons/follow-button/FollowButton';

const UserFollowCard = (props) => {
    const isFollowing = props.isFollowing;
    const isLoading = props.isLoading;
    return (
        <div className={`card ${classes['main']}`}>
            <div className={`card-body ${classes['main-body']}`}>
                <div className={classes[`left-container`]}>
                    <div className={classes['img-container']}>
                        <Link to={`/profile/${props.username}`}>
                            <img src={props.profileImg} />
                        </Link>
                    </div>
                    <div className={classes['content']}>
                        <Link to={`/profile/${props.username}`} className={classes['link-text']}>
                            <h5 className={classes['name']}>{props.name}</h5>
                        </Link>
                        <h6 className={classes['username']}>@{props.username}</h6>
                    </div>
                </div>
                {/* {
                    !isLoading && (
                        (!isFollowing && <button className={`btn btn-primary`} onClick={props.onFollow.bind(this, props.id, 'follow')}>follow</button>) ||
                        (isFollowing && <button className={`btn btn-outline-primary`} onClick={props.onFollow.bind(this, props.id, 'unfollow')}>unfollow</button>)
                    )
                } */}
                {!isLoading && < FollowButton isFollowing={isFollowing} onFollow={props.onFollow} userId={props.id} />}
                {isLoading && <LoadingSpinner />}
            </div>
        </div>
    )
}

export default UserFollowCard;