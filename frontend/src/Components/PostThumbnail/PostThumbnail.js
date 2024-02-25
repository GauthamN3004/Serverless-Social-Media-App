import { useState } from "react";
import "./PostThumbnail.css"

function PostThumbnail(props) {
    const [isModelOpen, setModalOpen] = useState(false);
    return <div className="post-thumbnail col-md-4">
        <img src={props.post.thumbnail} alt="image"></img>
    </div>
}

export default PostThumbnail;