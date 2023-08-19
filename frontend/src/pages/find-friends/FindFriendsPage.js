import classes from './FindFriendsPage.module.css';
import { useHistory, useLocation } from 'react-router-dom';

import UserFollowCard from "../../Ui/user-follow-card/UserFollowCard";
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useRef, useState } from 'react';
import sendRequest from '../../helper/sendRequest';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../Ui/LoadingSpinner';

const FindFriendsPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [queryParamValue, setQueryParamValue] = useState('');
    const location = useLocation();
    const history = useHistory();

    // Access individual query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const newQueryParam = searchParams.get('path');
        setQueryParamValue(newQueryParam);
        if (!newQueryParam) {
            history.replace('/find-friends?path=all');
        }
        // console.log(queryParamValue);
    }, [history, location.search]);

    const navAllActiveClass = queryParamValue === 'all' ? classes.active : '';
    const navFollowingActiveClass = queryParamValue === 'following' ? classes.active : '';
    const navFollowersActiveClass = queryParamValue === 'followers' ? classes.active : '';

    const authData = useSelector(state => state.auth);
    const [users, setUsers] = useState([]);
    const searchTimer = useRef(null);
    //fetch placeholder image
    const placeholderImg = '/profile-pic-default.webp';
    useEffect(() => {
        const image = new Image();
        image.src = placeholderImg;
    }, []);

    //get users function
    const getUsers = async () => {
        let url = '/user/search?select=fname,lname,username,profileImg&searchTerm=' + searchInput;
        if (queryParamValue === 'following') url += '&isFollowing=true';
        if (queryParamValue === 'followers') url += '&isFollower=true';
        //console.log('get users');
        setUsersLoading(true);
        const [data, error] = await sendRequest({
            method: 'GET',
            url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authData.token
            }
        });
        if (error) {
            return console.log(error);
        }
        console.log(data.users);
        setUsers(data.users.map(el => {
            el.isLoading = false;
            return el;
        }));
        setUsersLoading(false);
    }

    // run user function
    useEffect(() => {
        getUsers();
    }, [queryParamValue]);

    // on click follow
    const followHandler = async (followerId, followState) => {
        // console.log('follow' + followerId);
        //setup varibales for based on followState
        const isFollowing = followState === 'follow'
        const body = isFollowing ?
            { followingUserId: followerId } :
            { unfollowingUserId: followerId };

        // update to DB
        setUsers(prevState => prevState.map(el => el._id === followerId ? { ...el, isLoading: true } : el));
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
            return console.log(error);
        }
        // change follow status locally
        setUsers(prevState => prevState.map(el => el._id === followerId ? { ...el, isFollowing: isFollowing, isLoading: false } : el));
    }

    //search input
    const updateSearchInputHandler = (event) => {
        // console.log(event.target.value);
        setSearchInput(event.target.value);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            getUsers();
        }, 500);
    }


    return (
        <div>
            <h1>Find friends</h1>
            <input type="text" className={`form-control ${classes['search']}`} placeholder='search...' value={searchInput} onChange={updateSearchInputHandler} />

            <ul className={classes['tabs']}>
                <li className={classes['tab-item'] + ' ' + navAllActiveClass}>
                    <NavLink to='?path=all' className={navAllActiveClass}>All</NavLink>
                </li>
                <li className={classes['tab-item'] + ' ' + navFollowingActiveClass}>
                    <NavLink to='?path=following' className={queryParamValue === 'following' ? classes.active : ''}>Following</NavLink>
                </li>
                <li className={classes['tab-item'] + ' ' + navFollowersActiveClass}>
                    <NavLink to='?path=followers' className={queryParamValue === 'followers' ? classes.active : ''}>Followers</NavLink>
                </li>
            </ul>
            <hr className={classes['hr-line-tab']} />
            {/* <div className={classes['card-container']}>
                {queryParamValue === 'all' && <h2>All</h2>}
                {queryParamValue === 'following' && <h2>Following</h2>}
                {queryParamValue === 'followers' && <h2>Followers</h2>}
            </div> */}
            {usersLoading &&
                <div className="center">
                    <LoadingSpinner />
                </div>
            }
            {
                users.length <= 0 && <p>User not found</p>
            }
            {
                !usersLoading &&
                users.length > 0 &&
                (users.map(user => (
                    <UserFollowCard
                        name={user.fname}
                        username={user.username}
                        profileImg={user.profileImg || placeholderImg}
                        isFollowing={user.isFollowing}
                        key={user.username}
                        onFollow={followHandler}
                        id={user._id}
                        isLoading={user.isLoading}
                    />
                )))
            }
        </div>
    )
}

export default FindFriendsPage;