import { useState } from "react";
import { Modal } from 'antd';
import "./PostThumbnail.css"

import LikeButton from "../LikeButton/LikeButton";

function PostThumbnail(props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [videoRef, setVideoRef] = useState(null);
    const [likeCount, setLikeCount] = useState(props.post.likes);
    const [commentCount, setCommentCount] = useState(props.post.comments);



    const handlePostOpen = () => {
        setModalOpen(true);
    }

    const handleCancel = () => {
        setModalOpen(false);
        if (videoRef) {
            videoRef.pause(); // Pause the video
            videoRef.currentTime = 0; // Reset video progress to start
        }
    }

    const handleLikeClick = () => {
        
    }

    return <>
        <div className="post-thumbnail col-md-4" onClick={handlePostOpen}>
            <img src={props.post.thumbnail} alt="image"></img>
        </div>
        <Modal
            open={isModalOpen}
            onOk={handleCancel}
            onCancel={handleCancel}
            footer={null}
            className="custom-modal"
            width={700}
        >
            <div className="caption">
                <p>{props.post.caption}</p>
            </div>
            <div className="post-file">
            {
                !props.post.isVideo 
                ? <img src={props.post.file} alt="image" />
                : <video ref={(ref) => setVideoRef(ref)} controls>
                    <source src={props.post.file} type="video/mp4" />
                </video>
            }
            </div>
            {
                (props.viewingUser != props.loggedIn_username_short) && 
                <div className="like-div">
                    <LikeButton 
                        postId={props.post.postId.replace('POST#ID#', '')} 
                        poster_userId={props.post.userId.replace('USER#ID#', '')} 
                        liker_userId={props.loggedIn_userId}
                        likesCount={likeCount}
                        setLikesCount={setLikeCount}
                    />
                </div>
            }
            <div className="post-stats">
                <p><b>LIKES:</b> {likeCount} <span class="tab"></span> <b>COMMENTS:</b> {commentCount}</p>
            </div>
            <div className="comment-div">COMMENT</div>
        </Modal>
    </>
}

export default PostThumbnail;