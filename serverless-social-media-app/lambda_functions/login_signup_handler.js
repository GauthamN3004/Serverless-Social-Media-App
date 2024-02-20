'use strict';
const dynamoDB = require("aws-sdk/clients/dynamodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});
const tableName = process.env.MAIN_TABLE;

const getUser = async (username) => {
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
    return data;
}

const getResponse = (statusCode, status, message) => {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            status: status,
            message: message,
        }),
    }
}

module.exports.userLogin = async (event, context) => {
    const event_data = JSON.parse(event.body);
    
    try{
        const data = await getUser(event_data.username);
        if(data.length == 0){
            return getResponse(401, 'unauthorized', 'Username or password is incorrect');
        }

        const user = data[0];
        const hashedPassword = user.password;

        const pass_compare = await bcrypt.compare(event_data.password, hashedPassword);
        if(!pass_compare){
            return getResponse(401, 'unauthorized', 'Username or password is incorrect');
        }

        const payload = {
            userId: user['PK'],
            username: user['SK']
        };

        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const message = {
            "token": token,
            "userId": user['PK'],
            "username": user['SK']
        }

        return  getResponse(200, 'success', message);
    } catch(error) {
        return getResponse(500, 'error', error.message);
    }
};

module.exports.userSignUp = async (event, context) => {
	let event_data = JSON.parse(event.body);
	let userId = uuidv4();
	try{
		const data = await getUser(event_data.username);
        if (data.length > 0){
            return getResponse(409, 'conflict', 'Username already exists');
        }
        
        const hashedPassword = await bcrypt.hash(event_data.password, 10);

        var newUserParams = {
			TableName : tableName,
			Item: {
			   PK: `USER#ID#${userId}`,
			   SK: `USER#UNAME#${event_data.username}`,
               password: hashedPassword,
               email: event_data.email,
               full_name: event_data.full_name,
			   followers: 0,
               following: 0,
               profile_pic: 'None'
			}
		};

		await documentClient.put(newUserParams).promise();

        return getResponse(201, 'success', 'User created succesfully');
	} catch(error) {
		return getResponse(500, 'error', error.message);
	}

};