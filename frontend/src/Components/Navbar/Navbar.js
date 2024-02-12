import React, { useState } from 'react';
import "./Navbar.css"
import { Link, NavLink } from "react-router-dom";
import imageLogo from "../../ssma_logo.png";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    function handleClick() {
        setMenuOpen(!menuOpen);
    }

    return (
        <>
            <nav className="navBar">
                <div className="brandLogo">
                <Link to="/feed">
                    <img src={imageLogo} height={80} alt="Logo"></img>
                </Link>
                </div>
                <div className="toggleButton" onClick={() => handleClick()}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
                </div>
                <div className="navBarLinks">
                <ul className={menuOpen ? "open" : ""}>
                    {/* <li>
                    <NavLink to="/about">ABOUT</NavLink>
                    </li> */}
                    <li><NavLink>CREATE POST</NavLink></li>
                    <li><NavLink>LOGOUT</NavLink></li>
                </ul>
                </div>
            </nav>
        </>
    )
}

export default Navbar;