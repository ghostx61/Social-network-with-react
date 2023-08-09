import classes from './FindFriendsPage.module.css';
import UserFollowCard from "../../Ui/user-follow-card/UserFollowCard";

const FindFriendsPage = () => {
    return (
        <div>
            <h1>Find friends</h1>
            <input type="text" name="" id="" className={`form-control ${classes['search']}`} placeholder='search...' />
            <UserFollowCard />
        </div>
    )
}

export default FindFriendsPage;