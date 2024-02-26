'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});
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

const generatePresignedURL = (key) => {
	try{
        const params = {
            Bucket: 'serverless-social-media-app-v2',
            Key: key,
            Expires: 900
        };
        const presignedUrl = s3.getSignedUrl('getObject', params);

        return presignedUrl;
	} catch(error) {
		return "Error";
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

const getPosts = async (event) => {
	let userId = 'USER#ID#' + '3330db8a-ab00-4740-b327-e8b7fe55696b';
	const tableName = process.env.MAIN_TABLE;
    const lastEvaluatedKey = null;
	
    const params = {
		TableName: 'SSMA_Main',
		IndexName: 'InvertedIndex',
		KeyConditionExpression: 'SK = :sk_val AND begins_with(PK, :pk_val)',
		ExpressionAttributeValues: {
		  ':sk_val': userId,
		  ':pk_val': 'POST#'
		},
		Limit: 1,
		ScanIndexForward: false
	};
	
	params.ExclusiveStartKey = {
        "PK": "POST#1708828969#f652f5c4-2713-406a-a135-de0bae98b5a8",
        "SK": "USER#ID#3330db8a-ab00-4740-b327-e8b7fe55696b"
    };

	const data = await documentClient.query(params).promise();
    console.log(data.Items);
    const res = []
    for(let post_index = 0; post_index < data.Items.length; post_index++){
        var post_data = {
            "caption": data.Items[post_index].postCaption,
            "likes": data.Items[post_index].likes,
            "comments": data.Items[post_index].comments,
            "userId": data.Items[post_index].SK,
            "file": generatePresignedURL(data.Items[post_index].file),
            "thumbnail": generatePresignedURL(data.Items[post_index].thumbnail || data.Items[post_index].file)
        }
        res.push(post_data);
    }
    console.log(res);
};

getPosts();