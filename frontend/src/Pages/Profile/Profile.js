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
    const [profileUserId, setProfileUserId] = useState(null);
    const [profileFound, setProfileFound] = useState(null);
    const [following, setFollowing] = useState(null);
    const userData = JSON.parse(localStorage.getItem('ssma-auth'));
    const loggedIn_userId = userData['userId'].replace('USER#ID#', '');
    const loggedIn_username_short = userData['username'].replace('USER#UNAME#', '');

    axios.defaults.headers.common['Authorization'] = userData['token'];

    const checkFollowing = async () => {
        if(profileUserId && loggedIn_username_short !== username){
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${profileUserId}/follower/${loggedIn_userId}`, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });

            if(response.status == 200){
                const data = response.data;
                if(data.message == 'yes'){
                    setFollowing(true);
                }
                else if (data.message == 'no') {
                    setFollowing(false);
                }
            }
        }
    }

    const followUser = async (followee_uname) => {
        try{
            const body = {"followee_uname": followee_uname, "follower_uname": loggedIn_username_short}
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${profileUserId}/follower/${loggedIn_userId}`,
                body,
                {
                    validateStatus: function (status) {
                        return status >= 200 && status < 500;
                    },
                }
            );
            if(response.status == 201){
                setFollowing(true);
                setProfile(prevProfile => ({
                    ...prevProfile,
                    followers: prevProfile.followers + 1
                }));
            }
        } catch(error) {
            console.log(error.message);
            toast.error("Something went wrong");
        }
    }

    const unFollowUser = async (followee_uname) => {
        try{
            const body = {"followee_uname": followee_uname, "follower_uname": loggedIn_username_short}
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${profileUserId}/follower/${loggedIn_userId}/unfollow`,
                body,
                {
                    validateStatus: function (status) {
                        return status >= 200 && status < 500;
                    },
                }
            );
            if(response.status == 200){
                setFollowing(false);
                setProfile(prevProfile => ({
                    ...prevProfile,
                    followers: prevProfile.followers - 1
                }));
            }
        } catch(error) {
            console.log(error.message);
            toast.error("Something went wrong");
        }
    }

    const fetchUserDetails = async () => {
        try{
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?username=${username}`, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });

            if(response.status == 200){
                setProfile(response.data.data[0]);
                setProfileFound(true);
                setProfileUserId(response.data.data[0].PK.replace('USER#ID#', ''))
            }
            else {
                setProfileFound(false);
            }
            
            setLoading(false);
        } catch(error) {
            console.log(error.message);
            toast.error("Something went wrong!");
            setLoading(false);
        }
    }

    useEffect(() => {
        setFollowing(null);
        fetchUserDetails();
    }, [username])

    useEffect(() => {
        checkFollowing();
    }, [profileUserId])


    return (
        <Layout>
            {(profileFound) ?
                <div className="parent-div">
                    <div className="row profile-data">
                        <div className="col-md-4 col-lg-6 profile-pic">
                            <center><img src={profile.profile_pic}></img></center>
                        </div>
                        <div className="col-md-8 col-lg-6 user-info">
                            <div className="username">
                                <p>{profile.SK.replace('USER#UNAME#','')}</p>
                                {
                                    (username === loggedIn_username_short) && <button className="btn btn btn-light">EDIT PROFILE</button>
                                }
                                {
                                    (username !== loggedIn_username_short && following === true ) && <button className="btn btn btn-danger" onClick={() => {console.log("PROF + " + profile.SK); unFollowUser(profile.SK.replace('USER#UNAME#',''))}}>UNFOLLOW</button>
                                }
                                {
                                    (following === false ) && <button className="btn btn btn-primary" onClick={() => followUser(profile.SK.replace('USER#UNAME#',''))}>FOLLOW</button>
                                }
                            </div>
                            <div className="profile-buttons">
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