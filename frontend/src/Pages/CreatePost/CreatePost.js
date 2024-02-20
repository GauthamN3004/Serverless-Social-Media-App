import { useState } from "react";
import Layout from "../../Components/Layout/Layout";
import "./CreatePost.css";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { Progress } from 'antd';
import toast from 'react-hot-toast';

function CreatePost () {
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState('');
    const [progress, setProgress] = useState(0);
    const [isUploading, setUploading] = useState(false);

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        const fileExt = file.name.split('.').at(-1)
	    const fileSize = file.size;
        const postId = `POST#${Math.floor(new Date().getTime() / 1000)}#${uuidv4()}`
        const fileName = `${postId}.${fileExt}`

        try {
            setUploading(true);
            let res = await axios.post(`${process.env.REACT_APP_API_URL}/api/s3/get-upload-id`, { fileName: fileName });
            const uploadId = res.data.uploadId;
    
            // // In react use useState. Beacause we are using plain javascript, I've used session storage to store the uploadID which we can use later to abort upload process
            sessionStorage.setItem('uploadId', uploadId);
    
            console.log('Inside uploadMultipartFile');
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
                
                // Start sending files to S3 part by part
    
                let uploadChunck = await fetch(preSignedUrl, {   
                    method: 'PUT',
                    body: fileBlob
                });
                let EtagHeader = uploadChunck.headers.get('ETag');
                let uploadPartDetails = {
                    ETag: EtagHeader,
                    PartNumber: uploadCount
                };
                console.log(Math.floor(uploadCount * 100 / chunkCount));
                multiUploadArray.push(uploadPartDetails);
                setProgress(Math.floor(uploadCount * 100 / chunkCount));
            }
            
            const completeUpload = await axios.post(`${process.env.REACT_APP_API_URL}/api/s3/complete-upload`, {
                fileName: fileName,
                parts: multiUploadArray,
                uploadId: uploadId
            });
    
            console.log(completeUpload.data, 'complete upload response');
            setUploading(false);
            setProgress(0);
            toast.success("Post Uploaded Successfully");
        } catch (error) {
            console.log(error, error.stack);
            setUploading(false);
            setProgress(0);
        }
    }

    return <Layout>
        <form className="create-post-form">
                <center><h4>CREATE POST</h4></center>
                <div className="form-group">
                    <label>CAPTION</label>
                    <textarea class="form-control" value = {caption} onChange={(e) => setCaption(e.target.value)} rows={3} required></textarea>
                </div><br></br>
                <div className="form-group">
                    <label>IMAGE / VIDEO</label>
                    <input type="file" className="form-control" accept=".jpeg, .jpg, .png, .mp4" required onChange={(e) => setFile(e.target.files[0])}/>
                </div><br></br>
                <center><button className="btn btn-primary" onClick={(e) => handlePostSubmit(e)}>SUBMIT</button></center>
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