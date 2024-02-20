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
			data: data
        }),
    }
}

const generatePresignedURL = async (event, context) => {
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
		return getResponse(500, 'error', error.message, "");
	}
};

const createMultipartUpload = async (event) => {
	//const body = JSON.parse(event.body);
    const body = {'fileName': 'test'}

	try {
		const ttl = 20 * 60 * 1000; 
		const expires = Date.now() + ttl;
		let params = {
			Bucket: process.env.S3_BUCKET,
			Key: body.fileName,
			Expires: expires
		};
		const multiPartUpload = await s3.createMultipartUpload(params).promise();

        return getResponse(200, 'success', "Upload ID generated", { uploadId: multiPartUpload.UploadId });
	} catch (error) {
		console.log(error);
        return getResponse(500, 'error', error.message, "");
	}
};

const getresult = async () => {
    const res = await createMultipartUpload();
    console.log(res);
    const response = JSON.parse(res['body']);
    console.log(response);
    const uploadId = response['data']['uploadId'];
    console.log(uploadId);
}

getresult();