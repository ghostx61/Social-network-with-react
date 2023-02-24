import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classes from './ProfilePage.module.css';
import sendRequest from '../../helper/sendRequest';

import LoadingSpinner from '../../Ui/LoadingSpinner';
import { formatDate2 } from '../../helper/dataTransform';

const ProfilePage = () => {
    const authData = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});
    // console.log('/profile/' + authData.username);
    useEffect(() => {
        setIsLoading(true);
        const getUserProfile = async () => {
            const [data, error] = await sendRequest({
                method: 'GET',
                url: '/profile/' + authData.username,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authData.token
                }
            });
            if (error) {
                return console.log(error);
            }
            data.createdAt = formatDate2(data.createdAt);
            if (data.dob) data.dob = formatDate2(data.dob);
            setUser(data);
            console.log(data);
            setIsLoading(false);
        }
        getUserProfile();
    }, [])
    return (
        <Fragment>
            {isLoading && <div className='center'>
                <LoadingSpinner />
            </div>}
            {!isLoading && <div className={classes['profile']}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" className={classes['profile-img']} />
                <div className={`card ${classes['profile-container']}`}>
                    <Link to="/profile/edit" className={`btn btn-primary ${classes['edit-btn']}`}>Edit Profile</Link>
                    <div className="card-body">
                        <h5 className="card-title">{user.fname} {user.lname}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">{user.username}</h6>
                        {user.bio && <p>{user.bio}</p>}
                        {user.dob && <div className={classes['birthday']}>
                            <img src="https://img.icons8.com/sf-black-filled/64/null/birthday.png" />
                            <p>{user.dob}</p>
                        </div>}
                        <p className={classes['join-date']}>Joined on {user.createdAt}</p>
                    </div>
                </div>
            </div>}
        </Fragment>
    );
}


export default ProfilePage;