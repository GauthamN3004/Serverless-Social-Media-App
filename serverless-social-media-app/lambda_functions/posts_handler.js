'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new AWS.S3();

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

module.exports.createPost = async (event, context) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	const userId = event.pathParameters.userId;
	const createPostItem = {
		PK: `${event_data.postId}`,
		SK: `USER#ID#${userId}`,
		uploader_username: `USER#UNAME#${event_data.username}`,
		postCaption: event_data.caption,
		file: event_data.file,
		likes: 0,
		comments: 0,
		isVideo: event_data.isVideo
	}
	if(event_data.thumbnail){
		createPostItem.thumbnail = event_data.thumbnail
	}

	try{
		const createPostParams = {
			TableName : tableName,
			Item: createPostItem
		};
		
		const updatePostCountParams = {
			TableName: tableName,
			Key: { PK: `USER#ID#${userId}`, SK: `USER#UNAME#${event_data.username}` },
			UpdateExpression: 'SET posts = posts + :incr',
			ExpressionAttributeValues: { ':incr': 1 },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		console.log(updatePostCountParams);

		const params = {
            TransactItems: [
                { Put: createPostParams },
                { Update: updatePostCountParams }
            ]
        };

		await documentClient.transactWrite(params).promise();

		return getResponse(201, 'success', 'Post created succesfully', {});
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}
};

module.exports.updatePost = async (event, context, cb) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
		var params = {
			TableName: tableName,
			Key: { PK: `POST#ID#${postId}`, SK: `USER#ID#${userId}`},
			UpdateExpression: 'set #att1 = :val1',
			ExpressionAttributeNames: {'#att1': 'postCaption'},
			ExpressionAttributeValues: {':val1' : event_data.caption},
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};
		
        await documentClient.update(params).promise();
		return getResponse(200, 'success', 'Post data updated successfully', {});
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}
};

module.exports.getPosts = async (event) => {
	let userId = 'USER#ID#' + event.pathParameters.userId;
	const tableName = process.env.MAIN_TABLE;
	const queryStringParameters = event.queryStringParameters;
	try{
		const params = {
			TableName: tableName,
			IndexName: 'InvertedIndex',
			KeyConditionExpression: 'SK = :sk_val AND begins_with(PK, :pk_val)',
			ExpressionAttributeValues: {
			  ':sk_val': userId,
			  ':pk_val': 'POST#'
			},
			Limit: 3,
			ScanIndexForward: false
		};
		
		if (queryStringParameters && queryStringParameters.prevPost !== null) {
			params.ExclusiveStartKey = {
				"PK": queryStringParameters.prevPost,
				"SK": userId
			};
		}
		
		const data = await documentClient.query(params).promise();
		const response = {}
		const result = []
		for(let post_index = 0; post_index < data.Items.length; post_index++){
			var post_data = {
				"caption": data.Items[post_index].postCaption,
				"likes": data.Items[post_index].likes,
				"comments": data.Items[post_index].comments,
				"userId": data.Items[post_index].SK,
				"file": generatePresignedURL(data.Items[post_index].file),
				"thumbnail": generatePresignedURL(data.Items[post_index].thumbnail || data.Items[post_index].file)
			}
			result.push(post_data);
		}
	
		response.posts = result;
		if (data.LastEvaluatedKey) {
			response.lastEvaluatedKey = data.LastEvaluatedKey;
		}

		return getResponse(200, 'success', '', response);
	} catch (error) {
		console.log(error);
		return getResponse(500, 'error', error.message, {});
	}
};

module.exports.deletePost = async (event, context, cb) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
		var params = {
			TableName: tableName,
			Key: { PK: `POST#ID#${postId}`, SK: `USER#ID#${userId}`},
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};
		
		await documentClient.delete(params).promise();
		return getResponse(200, 'success', 'Post deleted successfully', {});
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}
};