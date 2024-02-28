'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});

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

module.exports.likePost = async (event) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
        const queryStringParameters = event.queryStringParameters;
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
                            SK: `LIKE#USER#ID#${queryStringParameters.liker}`,
                        },
                        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
                    },
                }
            ]
        };
        

		await documentClient.transactWrite(params).promise();

        return getResponse(201, 'success', 'Post was liked', {});
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}

};

module.exports.unlikePost = async (event) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
        const queryStringParameters = event.queryStringParameters;
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
                        Key: { PK: `POST#ID#${postId}`, SK: `LIKE#USER#ID#${queryStringParameters.liker}` },
                        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
                    }
                }
            ]
        };
        

		await documentClient.transactWrite(params).promise();

        return getResponse(200, 'success', 'Post was unliked', {});
	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}

};


module.exports.getPostLike = async (event) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        let userId = event.pathParameters.userId;
        let postId = event.pathParameters.postId;
        const queryStringParameters = event.queryStringParameters;
        var params = {
            TableName : tableName,
            Key: {
                PK: `POST#ID#${postId}`,
                SK: `LIKE#USER#ID#${queryStringParameters.liker}`
            }
        };
        

		const resp = await documentClient.get(params).promise();

		if (resp && resp.Item) {
            return getResponse(200, 'success', 'yes', {});
        } else {
            return getResponse(404, 'success', 'no', {});
        }

	} catch(error) {
		return getResponse(500, 'error', error.message, {});
	}

};