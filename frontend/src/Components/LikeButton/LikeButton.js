import { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

function LikeButton (props) {
    const [isLiked, setLiked] = useState(null);
    const [likeLoading, setLikedLoading] = useState(true);

    const fetchPostLike = async () => {
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${props.poster_userId}/posts/${props.postId}/like?liker=${encodeURIComponent(props.liker_userId)}`, {}, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });

            if(response.status == 200) {
                if(response.data.message == 'yes'){
                    setLiked(true);
                } else if (response.data.message == 'no'){
                    setLiked(false);
                }
            }
            setLikedLoading(false);
        } catch(error) {
            console.log(error.message);
            setLikedLoading(false);
            toast.error("Something went wrong");
        }
    }

    const handleLikePost = async () => {
        try{
            setLikedLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${props.poster_userId}/posts/${props.postId}/like?liker=${encodeURIComponent(props.liker_userId)}`, {}, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });
    
            if(response.status === 201) {
                setLiked(true);
                props.setLikesCount(props.likesCount + 1);
            }

            setLikedLoading(false);
        } catch (error) {
            console.log(error.message);
            setLikedLoading(false);
            toast.error("Something went wrong");
        }
    }

    const handleUnlikePost = async () => {
        try{
            setLikedLoading(true);
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${props.poster_userId}/posts/${props.postId}/like?liker=${encodeURIComponent(props.liker_userId)}`, {}, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                },
            });
    
            if(response.status === 200) {
                setLiked(false);
                props.setLikesCount(props.likesCount - 1);
            }

            setLikedLoading(false);
        } catch (error) {
            console.log(error.message);
            setLikedLoading(false);
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        fetchPostLike();
    }, []);
    
    if (likeLoading) {
        return <div className="spinner-border m-3" role="status">
            <span className="sr-only"></span>
        </div>;
    } else if (!likeLoading && isLiked === true) {
        return <button className="btn btn-outline-danger" onClick={handleUnlikePost}>UNLIKE</button>;
    } else if (!likeLoading && isLiked === false) {
        return <button className="btn btn-outline-success" onClick={handleLikePost}>LIKE</button>;
    }
    return <></>
}

export default LikeButton;