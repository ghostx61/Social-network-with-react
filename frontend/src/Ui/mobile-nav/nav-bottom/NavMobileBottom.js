
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import sendRequest from '../../../helper/sendRequest';
import { NavLink, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import classes from './NavMobileBottom.module.css';
import useModal from '../../../hooks/use-modal';

const NavMobileBottom = () => {
    const authData = useSelector(state => state.auth);
    const isAuth = useSelector(state => state.auth.isAuthenticated);
    const username = authData.username;
    const [profileImg, setProfileImg] = useState('/profile-pic-default.webp');
    const homeIcon = <svg viewBox="0 0 576 512" className={classes['nav-img']}><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
    const location = useLocation();
    const pathname = location.pathname;

    //post modal
    const isPostModalOpen = useSelector(state => state.modal.isPostModalOpen);
    const toggleModal = useModal();

    // update user profile
    useEffect(() => {
        const getUserData = async () => {
            // console.log(authData.token);
            try {
                const [data, error] = await sendRequest({
                    method: 'GET',
                    url: `/profile/${username}?select=profileImg`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authData.token
                    }
                });
                if (error) {
                    console.log(error.message);
                    return;
                }
                // console.log(data);
                setProfileImg(data.profileImg || '/profile-pic-default.webp');
            } catch (e) {
                // setProfileImg('/profile-pic-default.webp');
                console.log(e.message);
            }
        }
        if (username) {
            getUserData();
        }
    }, [authData]);

    const openNewPostModal = () => {
        toggleModal.openModal('post');
    }


    return (
        <div className={classes['nav-main']}>
            <div className={classes['nav-items']}>
                <NavLink to='/'>
                    {pathname !== '/' && <img src="/home-white3.svg" alt="home" />}
                    {pathname === '/' && <img src="/home-white-fill3.svg" alt="home" />}
                </NavLink>
            </div>
            <div className={classes['nav-items']}>
                <NavLink to='/find-friends'>
                    {pathname !== '/find-friends' && <img src="/search-white.svg" alt="search" />}
                    {pathname === '/find-friends' && <img src="/search-white-fill.svg" alt="search" />}
                </NavLink>
            </div>
            <div className={classes['nav-items']}>
                <div onClick={openNewPostModal}>
                    <img src="/plus-white.png" alt="home" />
                </div>
            </div>
            <div className={`${classes['nav-items']} ${classes['profile-nav']}`}>
                <NavLink to={'/profile/' + username}>
                    <img src={profileImg} alt="home" />
                </NavLink>
            </div>
        </div>
    )
}

export default NavMobileBottom;