'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});

module.exports.likePost = async (event, context, cb) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
        const params = {
            TransactItems: [
                {
                    Update: {
                        TableName: tableName,
                        Key: { PK: `POST#ID#${postId}`, SK: `USER#ID#${userId}` },
                        UpdateExpression: 'SET likes = likes + :incr',
                        ExpressionAttributeValues: { ':incr': 1 },
                        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
                    }
                },
                {
                    Put: {
                        TableName: tableName,
                        Item: {
                            PK: `POST#ID#${postId}`,
                            SK: `USER#ID#${userId}#LIKE`,
                        },
                        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
                    },
                }
            ]
        };
        

		await documentClient.transactWrite(params).promise();
		cb(null, {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: `Post ${postId} was liked by User ${userId}`,
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



module.exports.unlikePost = async (event, context, cb) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
        const params = {
            TransactItems: [
                {
                    Update: {
                        TableName: tableName,
                        Key: { PK: `POST#ID#${postId}`, SK: `USER#ID#${userId}` },
                        UpdateExpression: 'SET likes = likes - :decr',
                        ExpressionAttributeValues: { ':decr': 1 },
                        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
                    }
                },
                {
                    Delete: {
                        TableName: tableName,
                        Key: { PK: `POST#ID#${postId}`, SK: `USER#ID#${userId}#LIKE` },
                        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
                    }
                }
            ]
        };
        

		await documentClient.transactWrite(params).promise();
		cb(null, {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: `Post ${postId} was unliked by User ${userId}`,
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