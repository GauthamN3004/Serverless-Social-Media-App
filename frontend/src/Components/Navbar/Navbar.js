import React, { useState } from 'react';
import "./Navbar.css"
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Modal } from 'antd';
import imageLogo from "../../ssma_logo.png";
import toast from 'react-hot-toast';
import axios from "axios";


function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [isSearching, setSearching] = useState(false);
    const [profile, setProfile] = useState({});
    const [profileFound, setProfileFound] = useState(null);
    const userData = JSON.parse(localStorage.getItem('ssma-auth'));
    const loggedIn_username = userData['username'];
    const loggedIn_username_short = loggedIn_username.replace('USER#UNAME#', '');


    const navigate = useNavigate();

    function showModal() {
        setModalOpen(true);
    }

    function handleClick() {
        setMenuOpen(!menuOpen);
    }

    const handleCancel = (e) => {
        setSearchText('');
        setModalOpen(false);
        setProfileFound(null);
    };

    function handleLogout() {
        toast.success("Logged Out!");
        localStorage.removeItem('ssma-auth');
        navigate("/");
    }

    function handleProfileReroute(url){
        handleCancel();
        navigate(url);
    }

    const handleSearch = async () =>{
        setSearching(true);
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?username=${searchText}`, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });
            
            if(response.status === 200){
                setProfile(response.data.data[0]);
                setProfileFound(true);
            }
    
            else if(response.status === 404){
                setProfile({});
                setProfileFound(false);
            }
        } catch(error){
            toast.error(error.message);
        }

        setSearching(false);
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
                    <li><NavLink  to={`/profile/${loggedIn_username_short}`}>MY PROFILE</NavLink></li>
                    <li><NavLink onClick={() => showModal()}>FIND USER</NavLink></li>
                    <li><NavLink to="/new-post">CREATE POST</NavLink></li>
                    <li ><NavLink to="/" onClick={() => handleLogout()}>LOGOUT</NavLink></li>
                </ul>
                </div>
            </nav>

            <Modal
                title="FIND USER"
                open={modalOpen}
                onOk={handleCancel}
                onCancel={handleCancel}
                footer={null}
            >
                <div className="form-group">
                    <input type='text' className='form-control' value={searchText} onChange={(e) => setSearchText(e.target.value)}></input>
                </div><br></br>
                <div className="form-group">
                    <center>{(isSearching) ? 
                        <button className="btn btn-info search-button" type="button" disabled>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> &nbsp;&nbsp;
                            <span className="sr-only">SEARCH</span>
                        </button>
                        :
                        <button type="submit" className="btn btn-info search-button" onClick={() => handleSearch()}>SEARCH</button>
                    }
                    </center>
                </div>
                <div className="search-results">
                    {profileFound === false && <center><h5>No Matching Profiles</h5></center>}
                    {profileFound === true && <Link to= {`/profile/${profile.SK.replace('USER#UNAME#', '')}`} onClick={() => handleProfileReroute(`/profile/${profile.SK.replace('USER#UNAME#', '')}`)}>
                        <div className='profile-card row'>
                            <div className='col-3'><img src={profile.profile_pic}></img></div>
                            <div className='col-9'>
                                <b>{profile.SK.replace('USER#UNAME#', '')}</b>
                                <p>{profile.full_name}</p>
                            </div>
                        </div>
                    </Link>
                    }
                </div>
            </Modal>
        </>
    )
}

export default Navbar;