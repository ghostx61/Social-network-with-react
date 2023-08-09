import classes from './UserFollowCard.module.css';

const UserFollowCard = (props) => {
    return (
        <div className="card">
            <div className={`card-body ${classes['main']}`}>
                <div className={classes[`left-container`]}>
                    <div className={classes['img-container']}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" />
                    </div>
                    <div className={classes['content']}>
                        <h5 className={classes['name']}>Ninad Hatankar</h5>
                        <h6 className={classes['username']}>@ninad123</h6>
                    </div>
                </div>
                <button className={`btn btn-primary`}>follow</button>
            </div>
        </div>
    )
}

export default UserFollowCard;