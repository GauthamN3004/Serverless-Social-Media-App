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
			data: data
        }),
    }
}

module.exports.sendFollowRequest = async (event, context) => {
	const tableName = process.env.MAIN_TABLE;
	let event_data = JSON.parse(event.body);
	let userId = event.pathParameters.userId;
	let followerId = event.pathParameters.followerId;
	try{
		const params = {
			TableName : tableName,
			Item: {
			   PK: `REQUESTEE#ID#${userId}`,
			   SK: `REQUESTER#ID#${followerId}`
			},
			ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
		};

		await documentClient.put(params).promise();
		return getResponse(201, 'success', 'Follow Request Sent', []);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.addFollower = async (event, context) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	let userId = event.pathParameters.userId;
	let followerId = event.pathParameters.followerId;

	try{
		const addFollowerParams = {
			TableName : tableName,
			Item: {
			   PK: `FOLLOWEE#ID#${userId}`,
			   SK: `FOLLOWER#ID#${followerId}`,
			   followee_uname: `USER#UNAME#${event_data.followee_uname}`,
			   follower_uname: `USER#UNAME#${event_data.follower_uname}`
			},
			ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
		};

		const updateFollowerCountParams = {
			TableName: tableName,
			Key: { PK: `USER#ID#${userId}`, SK: `USER#UNAME#${event_data.followee_uname}` },
			UpdateExpression: 'SET followers = followers + :incr',
			ExpressionAttributeValues: { ':incr': 1 },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		const updateFollowingCountParams = {
			TableName: tableName,
			Key: { PK: `USER#ID#${followerId}`, SK: `USER#UNAME#${event_data.follower_uname}` },
			UpdateExpression: 'SET following = following + :incr',
			ExpressionAttributeValues: { ':incr': 1 },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		const params = {
            TransactItems: [
                { Put: addFollowerParams },
                { Update: updateFollowerCountParams },
                { Update: updateFollowingCountParams }
            ]
        };

		await documentClient.transactWrite(params).promise();
		return getResponse(201, 'success', 'Follower added succesfully.', []);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.removeFollower = async (event, context) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	let userId = event.pathParameters.userId;
	let followerId = event.pathParameters.followerId;
	try{
		const deleteFollowerParams = {
			TableName : tableName,
			Key: { PK: `FOLLOWEE#ID#${userId}`, SK: `FOLLOWER#ID#${followerId}` },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		const updateFollowerCountParams = {
			TableName: tableName,
			Key: { PK: `USER#ID#${userId}`, SK: `USER#UNAME#${event_data.followee_uname}` },
			UpdateExpression: 'SET followers = followers - :decr',
			ExpressionAttributeValues: { ':decr': 1 },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		const updateFollowingCountParams = {
			TableName: tableName,
			Key: { PK: `USER#ID#${followerId}`, SK: `USER#UNAME#${event_data.follower_uname}` },
			UpdateExpression: 'SET following = following - :decr',
			ExpressionAttributeValues: { ':decr': 1 },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};

		const params = {
            TransactItems: [
                { Delete: deleteFollowerParams },
                { Update: updateFollowerCountParams },
                { Update: updateFollowingCountParams }
            ]
        };

		await documentClient.transactWrite(params).promise();
		return getResponse(200, 'success', 'Follower removed successfully.', []);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.checkIfFollowingUser = async (event, context) => {
	const tableName = process.env.MAIN_TABLE;
	let userId = event.pathParameters.userId;
	let followerId = event.pathParameters.followerId;
	console.log(userId);
	console.log(followerId);
	try{
        var params = {
            TableName: tableName,
			Key: {PK: `FOLLOWEE#ID#${userId}`, SK: `FOLLOWER#ID#${followerId}`}
        };
		console.log(params);

		const resp = await documentClient.get(params).promise();
		console.log(resp);
		console.log("Resp" + resp);
		if (resp && resp.Item) {
            return getResponse(200, 'success', 'yes', []);
        } else {
            return getResponse(200, 'success', 'no', []);
        }
		
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.getFollowers = async (event, context) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        var params = {
            TableName: tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `FOLLOWEE#ID#${event.pathParameters.userId}`
            },
            ScanIndexForward: true
        };

		const resp = await documentClient.query(params).promise();

		return getResponse(200, 'success', '', resp['Items']);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.getFollowees = async (event, context) => {
	const tableName = process.env.MAIN_TABLE;
	try{
        var params = {
            TableName: tableName,
            IndexName: 'InvertedIndex',
            KeyConditionExpression: 'SK = :sk',
            ExpressionAttributeValues: {
                ':sk': `FOLLOWER#ID#${event.pathParameters.userId}`
            },
            ScanIndexForward: true
        };

		const resp = await documentClient.query(params).promise();
		return getResponse(200, 'success', '', resp['Items']);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

