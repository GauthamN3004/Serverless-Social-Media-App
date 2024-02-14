import { useParams } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import "./Profile.css";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import axios from "axios";

function Profile() {
    const { username } = useParams();
    const [isLoading, setLoading] = useState(false);
    const [profile, setProfile] = useState({});
    const [profileFound, setProfileFound] = useState(null);
    const userData = JSON.parse(localStorage.getItem('ssma-auth'));
    const loggedIn_username = userData['username'];
    console.log(loggedIn_username);
    const loggedIn_username_short = loggedIn_username.replace('USER#UNAME#', '');

    const fetchUserDetails = async () => {
        try{
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?username=${username}`, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });

            if(response.status == 200){
                console.log(response.data.data);
                setProfile(response.data.data[0]);
                setProfileFound(true);
            }
            else {
                setProfileFound(false);
            }
            
            setLoading(false);
        } catch(error) {
            toast.error("Something went wrong!");
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log("effect");
        fetchUserDetails();
    }, [])

    return (
        <Layout>
            {(profileFound) ?
                <div className="parent-div">
                    <div className="row profile-data">
                        <div className="col-md-6 profile-pic">
                            <img src={profile.profile_pic}></img>
                        </div>
                        <div className="col-md-6 user-info">
                            <div className="username">
                                <p>{profile.SK.replace('USER#UNAME#','')}</p>
                            </div>
                            <div className="user-stats">
                                <div className="individual-stat">
                                    <div className="stat-title">
                                        <p>POSTS</p>
                                    </div>
                                    <div className="stat-value">
                                        <p>{profile.posts}</p>
                                    </div>
                                </div>
                                <div className="individual-stat">
                                    <div className="stat-title">
                                        <p>FOLLOWING</p>
                                    </div>
                                    <div className="stat-value">
                                        <p>{profile.following}</p>
                                    </div>
                                </div>
                                <div className="individual-stat">
                                    <div className="stat-title">
                                        <p>FOLLOWERS</p>
                                    </div>
                                    <div className="stat-value">
                                        <p>{profile.followers}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="full-name">
                                <p>{profile.full_name}</p>
                            </div>
                            {(profile.bio) ?
                            <div className="bio">
                                
                                <b>MY BIO</b><br></br>
                                <p>{profile.bio}</p>
                            </div>
                            :
                            <></>
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="posts">

                        </div>
                    </div>
                </div> 
                :
                <></>   
            }
            {(profileFound === false) ?
                <div>
                    <br></br>
                    <br></br>
                    <center><h4>Could not find user !</h4></center>
                </div>
                :<></>
                  
            }
        </Layout>
    )
}

export default Profile;