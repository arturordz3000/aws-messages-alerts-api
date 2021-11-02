
   
const DynamoDB = require("aws-sdk").DynamoDB

const dynamoDB = new DynamoDB.DocumentClient({
    region: 'us-east-2'
});

exports.handler = async function(event) {
    const message = event.Message;

    const dbParams = {
        TableName: 'Messages',
        Item: message
    };

    const response = await dynamoDB.put(dbParams).promise();

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response)
    }
}