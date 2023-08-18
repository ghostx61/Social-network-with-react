import classes from './FindFriendsPage.module.css';
import { useLocation } from 'react-router-dom';

import UserFollowCard from "../../Ui/user-follow-card/UserFollowCard";
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useState } from 'react';
import sendRequest from '../../helper/sendRequest';
import { useSelector } from 'react-redux';

const FindFriendsPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    // Access individual query parameters
    const queryParamValue = searchParams.get('path');
    //console.log(queryParamValue);

    const navAllActiveClass = queryParamValue === 'all' ? classes.active : '';
    const navFollowingActiveClass = queryParamValue === 'following' ? classes.active : '';
    const navFollowersActiveClass = queryParamValue === 'followers' ? classes.active : '';

    const authData = useSelector(state => state.auth);
    const [users, setUsers] = useState([]);
    //fetch placeholder image
    const placeholderImg = '/profile-pic-default.webp';
    useEffect(() => {
        const image = new Image();
        image.src = placeholderImg;
    }, []);
    //fetch users
    useEffect(() => {
        const getUsers = async () => {
            const [data, error] = await sendRequest({
                method: 'GET',
                url: '/user/search?select=fname,lname,username,profileImg',
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
        }
        getUsers();
    }, []);

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


    return (
        <div>
            <h1>Find friends</h1>
            <input type="text" name="" id="" className={`form-control ${classes['search']}`} placeholder='search...' />

            {/* Tabs  */}
            {/* <ul className="nav nav-underline">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page">Active</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link">Link</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link">Link</a>
                </li>
            </ul> */}

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
            <div className={classes['card-container']}>
                {queryParamValue === 'all' && <h2>All</h2>}
                {queryParamValue === 'following' && <h2>Following</h2>}
                {queryParamValue === 'followers' && <h2>Followers</h2>}
            </div>
            {
                users.map(user => (
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
                ))
            }
        </div>
    )
}

export default FindFriendsPage;