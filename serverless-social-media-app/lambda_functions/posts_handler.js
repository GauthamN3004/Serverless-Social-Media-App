'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});
const { v4: uuidv4 } = require('uuid');

module.exports.createPost = async (event, context, cb) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	let postId = uuidv4();
	try{
		const params = {
			TableName : tableName,
			Item: {
			   PK: `POST#ID#${postId}`,
			   SK: `USER#ID#${event.pathParameters.userId}`,
			   postReady: 'N',
               postCaption: event_data.caption,
               likes: 0,
               comments: 0
			}
		};

		await documentClient.put(params).promise();
		cb(null, {
			statusCode: 201,
			body: JSON.stringify({
				status: 'success',
				message: 'Post created succesfully.',
			}),
	    });
	} catch(error) {
		cb(null, {
			statusCode: 500,
			body: JSON.stringify({
				status: 'error',
				message: error.message,
                post_id: `POST#ID#${postId}`
			}),
	    });
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
		cb(null, {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: 'Post data updated successfully.',
			}),
	    });
	} catch(error) {
		cb(null, {
			statusCode: 500,
			body: JSON.stringify({
				status: 'error',
				message: error.message,
			}),
	    });
	}
};

module.exports.getPostById = async (event) => {
	let userId = event.pathParameters.userId;
    let postId = event.pathParameters.postId;
	return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'success',
      message: `Post ${postId}`,
    }),
  };
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
		return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: `Post deleted successfully.`,
			})
		};
	} catch(error) {
		cb(null, {
			statusCode: 500,
			body: JSON.stringify({
				status: 'error',
				message: error.message,
			}),
	    });
	}
};