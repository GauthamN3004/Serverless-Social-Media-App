import { useRef, useState } from "react";
import Layout from "../../Components/Layout/Layout";
import "./CreatePost.css";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { Progress } from 'antd';
import toast from 'react-hot-toast';

function CreatePost () {
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState('');
    const [thumbnailFileRequired, setThumbnailFileRequired] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isUploading, setUploading] = useState(false);
    const fileInputRef = useRef();
    const thumbnailInputRef = useRef();

    const userData = JSON.parse(localStorage.getItem('ssma-auth'));
    const loggedIn_username = userData['username'].replace('USER#UNAME#', '');
    const loggedIn_userId = userData['userId'].replace('USER#ID#', '');

    const handleFileChange = (e) => {
        const var_file = e.target.files[0];
        setFile(var_file);
        if (var_file && var_file.type === 'video/mp4') {
            setThumbnailFileRequired(true);
        } else{
            setThumbnailFileRequired(false);
            setThumbnailFile('');
        }
    }

    const uploadFile = async (file, postId, suffix) => {
        const fileExt = file.name.split('.').at(-1)
        const fileName = `${postId}${suffix}.${fileExt}`;
        let res = await axios.post(`${process.env.REACT_APP_API_URL}/api/s3/get-upload-id`, { fileName: fileName });
        const uploadId = res.data.uploadId;

	    const fileSize = file.size;
        const chunkSize = 10 * 1024 * 1024; // 10MiB
        const chunkCount = Math.floor(fileSize / chunkSize) + 1;
        // console.log(`chunkCount: ${chunkCount}`);

        let multiUploadArray = [];

        for (let uploadCount = 1; uploadCount <= chunkCount; uploadCount++) {
            let start = (uploadCount - 1) * chunkSize;
            let end = uploadCount * chunkSize;
            let fileBlob = uploadCount < chunkCount ? file.slice(start, end) : file.slice(start);

            let getSignedUrlRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/s3/get-upload-parts`, {
                fileName: fileName,
                partNumber: uploadCount,
                uploadId: uploadId
            });
            let preSignedUrl = getSignedUrlRes.data.preSignedUrl;

            let uploadChunck = await fetch(preSignedUrl, {   
                method: 'PUT',
                body: fileBlob
            });
            let EtagHeader = uploadChunck.headers.get('ETag');
            let uploadPartDetails = {
                ETag: EtagHeader,
                PartNumber: uploadCount
            };

            multiUploadArray.push(uploadPartDetails);
            setProgress(Math.floor(uploadCount * 100 / chunkCount));
        }
        
        const completeUpload = await axios.post(`${process.env.REACT_APP_API_URL}/api/s3/complete-upload`, {
            fileName: fileName,
            parts: multiUploadArray,
            uploadId: uploadId
        });

        completeUpload.filename = fileName;

        console.log(completeUpload);
        return completeUpload;
    }

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        if(caption === '') {
            toast.error("Please add caption");
            return;
        } else if (file === '') {
            toast.error("Please upload a video / image");
            return;
        } else if (thumbnailFileRequired && thumbnailFile === '') {
            toast.error("Please add a thumbnail for your video");
            return;
        }

        const postId = `POST#ID#${Math.floor(new Date().getTime() / 1000)}-${uuidv4()}`;
        
        try {
            setUploading(true);
            
            if(thumbnailFileRequired){
                var thumbnailUploadResult = await uploadFile(thumbnailFile, postId, '_thumbnail');
            }
            var fileUploadResult = await uploadFile(file, postId, '');
            
            if(fileUploadResult.data.status == 'success'){
                const post_data = {
                    postId: postId,
                    username: loggedIn_username,
                    file: fileUploadResult.filename,
                    caption: caption,
                    isVideo: thumbnailFileRequired
                }
                console.log(thumbnailFileRequired);
                if(thumbnailFileRequired){
                    console.log("adding thumbnail");
                    post_data.thumbnail = thumbnailUploadResult.filename
                }

                console.log(post_data);
                let post_res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/${loggedIn_userId}/posts`, post_data);

                fileInputRef.current.value = ""
                if(thumbnailFileRequired){
                    thumbnailInputRef.current.value = "";
                }

                setUploading(false);
                setProgress(0);
                setCaption('');
                setThumbnailFileRequired(false);

                toast.success("Post Uploaded Successfully");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error);
            setUploading(false);
            setProgress(0);
        }
    }

    return <Layout>
        <form className="create-post-form">
            <center><h4>CREATE POST</h4></center>
            <div className="form-group">
                <label>CAPTION</label>
                <textarea className="form-control" value = {caption} onChange={(e) => setCaption(e.target.value)} rows={3} required></textarea>
            </div><br></br>
            <div className="form-group">
                <label>IMAGE / VIDEO</label>
                <input type="file" className="form-control" accept=".jpeg, .jpg, .png, .mp4" required onChange={(e) => handleFileChange(e)} ref={fileInputRef}/>
            </div><br></br>
            
            {thumbnailFileRequired && 
                <div>
                    <div className="form-group">
                        <label>THUMBNAIL</label>
                        <input type="file" className="form-control" accept=".jpeg, .jpg, .png" required={thumbnailFileRequired} onChange={(e) => setThumbnailFile(e.target.files[0])}  ref={thumbnailInputRef}/>
                    </div><br></br>
                </div>
            }
            <center><button className="btn btn-primary" onClick={(e) => handlePostSubmit(e)} disabled={isUploading}>SUBMIT</button></center>
            <center>
                {isUploading && (
                    <div>
                    <br />
                    <Progress type="circle" percent={progress} />
                    </div>
                )}
            </center>
        </form>
        
    </Layout>
}

export default CreatePost;