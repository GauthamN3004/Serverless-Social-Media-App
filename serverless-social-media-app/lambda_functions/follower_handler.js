'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});

module.exports.addFollower = async (event, context, cb) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	let userId = event.pathParameters.userId;
	try{
		const params = {
			TableName : tableName,
			Item: {
			   PK: `FOLLOWEE#ID#${userId}`,
			   SK: `FOLLOWER#ID#${event_data.follower_id}`,
			   firstname: event_data.firstname
			},
			ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
		};

		await documentClient.put(params).promise();
		cb(null, {
			statusCode: 201,
			body: JSON.stringify({
				status: 'success',
				message: 'Follower added succesfully.',
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

module.exports.removeFollower = async (event, context, cb) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	try{
		var params = {
			TableName: tableName,
			Key: { PK: `FOLLOWEE#ID#${event.pathParameters.userId}`, SK: `FOLLOWER#ID#${event_data.follower_id}` },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};
		await documentClient.delete(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: `Follower Removed successfully.`,
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

module.exports.getFollowers = async (event, context, cb) => {
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

        return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
                data: resp['Items']
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

module.exports.getFollowees = async (event, context, cb) => {
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
        return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
                data: resp['Items']
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