import { Fragment } from 'react';
import LoadingSpinner from '../../LoadingSpinner';
import classes from './FollowButton.module.css';

const FollowButton = (props) => {
    const btnClass = props.addClass ? classes[props.addClass] : '';
    const spinner = (
        <LoadingSpinner />
    )
    const isLoading = props.isLoading;
    let button = <button className={`btn btn-primary`} onClick={props.onFollow.bind(this, props.userId, 'follow')}>follow</button>;
    if (props.isFollowing) {
        button = <button className={`btn btn-outline-primary`} onClick={props.onFollow.bind(this, props.userId, 'unfollow')}>unfollow</button>;
    }
    return (
        <span className={btnClass}>
            {isLoading && spinner}
            {!isLoading && button}
        </span>
    )
}


export default FollowButton;