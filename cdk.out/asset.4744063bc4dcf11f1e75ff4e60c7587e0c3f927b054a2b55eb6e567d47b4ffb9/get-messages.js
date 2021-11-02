const DynamoDB = require("aws-sdk").DynamoDB
const constants = require('my-constants').constants;

const dynamoDB = new DynamoDB.DocumentClient({
    region: 'us-east-2'
});

exports.handler = async function(event, context, callback) {
    const defaultStart = new Date();
    defaultStart.setUTCHours(0,0,0,0);
    
    const defaultEnd = new Date();
    defaultEnd.setUTCHours(23,59,59,999);

    let start = defaultStart.getTime();
    let end = defaultEnd.getTime();

    const queryString = event.queryStringParameters;
    
    if (queryString) {
        if (queryString.start) {
            start = (new Date(queryString.start)).getTime();
        }

        if (queryString.end) {
            end = (new Date(queryString.end)).getTime();
        }
    }

    const dbParams = {
        TableName: constants.tables.events,
        IndexName: constants.index.messageType,
        KeyConditionExpression: '#t = :type AND #cd BETWEEN :start_date AND :end_date',
        ExpressionAttributeNames:{
            '#t': 'type',
            '#cd': 'creation_date'
        },
        ExpressionAttributeValues: { ':type': 'message', ':start_date': start, ':end_date': end }
    };

    try
    {
        const result = await dynamoDB.query(dbParams).promise();

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };

        callback(null, response);
    } catch (error) {
        callback(null, {
            statusCode: error.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: error.message,
        });
    }
}


