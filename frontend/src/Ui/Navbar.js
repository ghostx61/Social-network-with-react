import { Fragment, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/use-Auth';

import classes from './Navbar.module.css';


const Navbar = () => {
    const isAuth = useSelector(state => state.auth.isAuthenticated);
    const [navDropdownActive, setNavDropdownActive] = useState(false);
    const { userLogout } = useAuth();
    const userNavLinks = (
        <Fragment>
            <li className={classes['nav-link']}>
                <NavLink to="/" activeClassName={classes['nav-link-active']} exact>Home</NavLink>
            </li>
            <li className={classes['nav-link']}>
                <NavLink to="/profile" activeClassName={classes['nav-link-active']}>Find friends</NavLink>
            </li>
        </Fragment>
    );

    const dropdownHandler = () => {
        setNavDropdownActive(state => !state);
    }
    const logoutHandler = () => {
        userLogout();
        setNavDropdownActive(false);
    }
    const dropdownClickHandler = () => {
        setNavDropdownActive(false);
    }

    return (
        <nav className={classes['navbar-new']}>
            <ul>
                <li className={classes['nav-logo']}>
                    <Link to="/"><img src={`${process.env.PUBLIC_URL}/camera.png`} /> Social Network</Link>
                </li>
                {isAuth && userNavLinks}
            </ul>
            <ul className={classes['nav-right']}>
                <li>
                    <input type="text" placeholder="Search" className={classes['nav-search']} />
                </li>
                <li className={classes['profile-img']} onClick={dropdownHandler}>
                    {/* <Link to="/"> */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" />
                    {/* </Link> */}
                </li>
            </ul>
            {navDropdownActive && <div className={`card ${classes['nav-dropdown']}`}>
                <ul className="list-group list-group-flush" onClick={dropdownClickHandler}>
                    <li className={`list-group-item ${classes['nav-dropdown-item']}`}>
                        <Link to="/profile">ninad123</Link>
                    </li>
                    <li className={`list-group-item ${classes['nav-dropdown-item']}`} onClick={logoutHandler}>Logout</li>
                    {/* <li className="list-group-item">A third item</li> */}
                </ul>
            </div>}
        </nav>
    );
}

export default Navbar;