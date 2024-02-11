const dynamoDB = require("aws-sdk/clients/dynamodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const documentClient = new dynamoDB.DocumentClient({region: 'ap-south-1'});
const tableName = 'SSMA_Main';

const getUser = async (username) => {
    console.log(`USER#UNAME#${username}`);
    var params = {
        TableName: tableName,
        IndexName: 'InvertedIndex',
        KeyConditionExpression: 'SK = :sk',
        ExpressionAttributeValues: {
            ':sk': `USER#UNAME#${username}`,
        }
    };

    const resp = await documentClient.query(params).promise();
    const data = resp['Items'];
    return data;
}

const getResponse = (statusCode, status, message) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify({
            status: status,
            message: message,
        }),
    }
}

const userLogin = async (event, context) => {
    //const event_data = JSON.parse(event.body);
    const event_data = {
        "username": "gauthamn3004",
        "password": "gautham"
    }
    
    try{
        const data = await getUser(event_data.username);
        if(data.length == 0){
            return getResponse(401, 'unauthorized', 'Username or password is incorrect');
        }
        console.log(data);
        const user = data[0];
        const hashedPassword = user.password;

        const pass_compare = await bcrypt.compare(event_data.password, hashedPassword);
        console.log(pass_compare);
        if(!pass_compare){
            return getResponse(401, 'unauthorized', 'Username or password is incorrect');
        }

        const payload = {
            userId: user['PK'],
            username: user['SK']
        };

        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        console.log(token);
        return  getResponse(200, 'success', token);
    } catch(error) {
        console.log(error.message);
        return getResponse(500, 'error', error.message);
    }
};

const userSignUp = async (event, context) => {
	// let event_data = JSON.parse(event.body);
    const event_data = {
        "username": "gauthamn3004",
        "password": "gautham"
    }
	let userId = uuidv4();
	try{
		const data = await getUser(event_data.username);
        console.log(data);
        if (data.length > 0){
            return getResponse(409, 'Conflict', 'Username already exists');
        }
        
        const hashedPassword = await bcrypt.hash(event_data.password, 10);
        console.log("Hashed Pass" + hashedPassword);
        var newUserParams = {
			TableName : tableName,
			Item: {
			   PK: `USER#ID#${userId}`,
			   SK: `USER#UNAME#${event_data.username}`,
               password: hashedPassword,
			   followers: 0,
               following: 0,
               profile_pic: 'None'
			}
		};

		// await documentClient.put(newUserParams).promise();

        return getResponse(201, 'success', 'User created succesfully');
	} catch(error) {
		return getResponse(500, 'error', error.message);
	}

};

userLogin();