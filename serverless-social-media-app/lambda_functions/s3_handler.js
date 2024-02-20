const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new AWS.S3();

const getResponse = (statusCode, status, message, data) => {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            status: status,
            message: message,
			...data
        }),
    }
}

module.exports.generatePresignedURL = async (event, context) => {
	try{
        const objectKey = 'test';
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: objectKey,
            Expires: 100
        };
        const presignedUrl = s3.getSignedUrl('putObject', params);

        return getResponse(200, 'success', "Presigned URL generated", presignedUrl);
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}
};

module.exports.createMultipartUpload = async (event) => {
	const body = JSON.parse(event.body);

	try {
		const ttl = 20 * 60 * 1000; 
		const expires = Date.now() + ttl;
		let params = {
			Bucket: 'serverless-social-media-app-v2',
			Key: body.fileName,
			Expires: expires
		};
        console.log(params);
		
        const multiPartUpload = await s3.createMultipartUpload(params).promise();

        console.log("Reached here");
        console.log(multiPartUpload);

        return getResponse(200, 'success', "Upload ID generated", { uploadId: multiPartUpload.UploadId });
	} catch (error) {
		console.log(error);
        return getResponse(500, 'error', error.message, {});
	}
};

module.exports.getUploadParts = async (event) => {
    const body = JSON.parse(event.body)
    try {
        let params = {
            Bucket: process.env.S3_BUCKET,
            Key: body.fileName,
			PartNumber: body.partNumber,
			UploadId: body.uploadId
        };
        
        const preSignedUrl = s3.getSignedUrl('uploadPart', params);
        return getResponse(200, 'success', "", {preSignedUrl : preSignedUrl});
    } catch (error) {
        console.log(error);
        return getResponse(500, 'error', error.message, {});
    }
}

module.exports.completeMultipartUpload = async (event) => {
	const body = JSON.parse(event.body);

	try {
		let params = {
			Bucket: process.env.S3_BUCKET,
			Key: body.fileName,
			MultipartUpload: {
				Parts: body.parts
			},
			UploadId: body.uploadId
		};
		const completeUpload = await s3.completeMultipartUpload(params).promise();
        return getResponse(200, 'success', "", {completeUpload : completeUpload});
	} catch (error) {
		console.log(error);
		return getResponse(500, 'error', error.message, {});
	}
};