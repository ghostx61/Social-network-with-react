import { Fragment } from 'react';
import { NavLink, Link } from 'react-router-dom';

import classes from './Navbar.module.css';
// import cameraLogo from `${process.env.PUBLIC_URL}/camera.png`;

const Navbar = () => {
    console.log(process.env.PUBLIC_URL);
    return (
        <nav className={classes['navbar-new']}>
            <ul>
                <li className={classes['nav-logo']}>
                    <Link to="/"><img src={`${process.env.PUBLIC_URL}/camera.png`} /> Social Network</Link>
                </li>
                <li className={classes['nav-link']}>
                    <NavLink to="/login" activeClassName={classes['nav-link-active']}>Home</NavLink>
                </li>

                <li className={classes['nav-link']}>
                    <NavLink to="/profile" activeClassName={classes['nav-link-active']}>Find friends</NavLink>
                </li>
            </ul>
            <ul className={classes['nav-right']}>
                <li>
                    <input type="text" placeholder="Search" className={classes['nav-search']} />
                </li>
                <li className={classes['profile-img']}>
                    <Link to="/">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" />
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;