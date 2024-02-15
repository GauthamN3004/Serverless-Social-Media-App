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

module.exports.getUserByUsername = async (event) => {
	const queryStringParameters = event.queryStringParameters;
	const tableName = process.env.MAIN_TABLE;
	if(queryStringParameters) {
		const username = queryStringParameters.username;
		var params = {
			TableName: tableName,
			IndexName: 'InvertedIndex',
			KeyConditionExpression: 'SK = :sk',
			ExpressionAttributeValues: {
				':sk': `USER#UNAME#${username}` 
			}
		};
	
		const resp = await documentClient.query(params).promise();
		const data = resp['Items'];
		if(data.length > 0){
			return getResponse(200, 'success', 'User data found', data);
		}
		
		return getResponse(404, "error", `No user found with username ${username}`, []);
	} else {
		return getResponse(400, "error", 'No query string parameters provided', []);
    }
};


module.exports.updateUser = async (event, context) => {
	let event_data = JSON.parse(event.body);
	let userId = event.pathParameters.userId;
	const tableName = process.env.MAIN_TABLE;
	try{
		let pk = `USER#ID#${userId}`;
		let sk = `USER#UNAME#${event_data.username}`;
		var params = {
			TableName: tableName,
			Key: { PK: pk, SK: sk },
			UpdateExpression: 'set #att1 = :val1, #att2 = :val2',
			ExpressionAttributeNames: {'#att1': 'firstname', '#att2': 'lastname'},
			ExpressionAttributeValues: {':val1' : event_data.firstname, ':val2' : event_data.lastname },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};
		await documentClient.update(params).promise();

		return getResponse(200, 'success', 'User data updated successfully.', []);
	} catch(error) {
		return getResponse(500, 'error', error.message, []);
	}
};

module.exports.deleteUser = async (event, context, cb) => {
	let event_data = JSON.parse(event.body);
	const tableName = process.env.MAIN_TABLE;
	try{
		let pk = `USER#ID#${event.pathParameters.userId}`;
		let sk = `USER#UNAME#${event_data.username}`;
		var params = {
			TableName: tableName,
			Key: { PK: pk, SK: sk },
			ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)'
		};
		await documentClient.delete(params).promise();
		return getResponse(200, 'success', 'User deleted successfully.', []);
	} catch(error) {
		return getResponse(500, "error", error.message, []);
	}
};
