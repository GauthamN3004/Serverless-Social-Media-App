'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});

module.exports.updateUser = async (event, context, cb) => {
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
		cb(null, {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: 'User data updated successfully.',
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

module.exports.getUserById = async (event) => {
	let userId = event.pathParameters.userId;
	return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'success',
      message: `User ${userId}`,
    }),
  };
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
		return {
			statusCode: 200,
			body: JSON.stringify({
				status: 'success',
				message: `User deleted successfully.`,
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
