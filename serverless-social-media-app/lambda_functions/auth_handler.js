const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const secretKey = process.env.SECRET_KEY;

const generateAuthResponse = (user, effect, methodArn) => {
    const authResponse = {
        principalId: user.userId,
    };

    console.log(user + " " +  effect + " " + methodArn);

    if (effect && methodArn) {
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: methodArn
            }]
        };
        authResponse.policyDocument = policyDocument;
        authResponse.context = user;
    }
    
    return authResponse;
};

module.exports.authorizer = async (event, context) => {
    try {
        const token = event.authorizationToken;
        const user = jwt.verify(token, secretKey);

        console.log(user);

        return generateAuthResponse(user, 'Allow', event.methodArn);
    } catch (error) {
        console.log(error.message);
        const dummy_user = {userId: -1};
        return generateAuthResponse(dummy_user, 'Deny', event.methodArn);
    }

};
