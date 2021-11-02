const DynamoDB = require("aws-sdk").DynamoDB
const constants = require('my-constants').constants;

const dynamoDB = new DynamoDB.DocumentClient({
    region: 'us-east-2'
});

exports.getEvent = async function(id, start, end, eventType, callback) {
    const conditions = getConditions(id, start, end, eventType);

    const dbParams = {
        TableName: constants.tables.events,
        ...conditions
    };

    try
    {
        const result = await dynamoDB.query(dbParams).promise();

        // The following lines are only used to remove the item when it doesn't match the event type requested by the user
        if (id) {
            result.Items = result.Items.filter(item => item.type === eventType);
        }

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

function getConditions(id, start, end, eventType) {
    const defaultStart = new Date();
    defaultStart.setUTCHours(0,0,0,0);
    
    const defaultEnd = new Date();
    defaultEnd.setUTCHours(23,59,59,999);

    let _start = defaultStart.getTime();
    let _end = defaultEnd.getTime();
    
    if (start) {
        _start = start;
    }

    if (end) {
        _end = end;
    }

    const conditions = {};

    if (id) {
        conditions.KeyConditionExpression = '#i = :id';
        conditions.ExpressionAttributeNames = {
            '#i': 'id',
        }
        conditions.ExpressionAttributeValues = { ':id': pathParams.id };
    } else {
        conditions.IndexName = constants.index.messageType;
        conditions.KeyConditionExpression = '#t = :type AND #cd BETWEEN :start_date AND :end_date';
        conditions.ExpressionAttributeNames = {
            '#t': 'type',
            '#cd': 'creation_date'
        }
        conditions.ExpressionAttributeValues = { ':type': eventType, ':start_date': _start, ':end_date': _end };
    }

    return conditions;
}

exports.putEvent = async function(payload, eventType, callback) {
    if (!payload) {
        const response = {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Error: Event body not provided'
        }
    }

    const item = {
        id: generateGuid(),
        type: eventType,
        value: payload[eventType].value,
        creation_date: (new Date()).getTime()
    };

    const dbParams = {
        TableName: constants.tables.events,
        Item: item
    };

    try
    {
        const result = await dynamoDB.put(dbParams).promise();

        const response = {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id: item.id})
        }

        callback(null, response);
    } catch (error) {
        callback(null, {
            statusCode: error.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: error.message,
        });
    }
}

function generateGuid() {
    function _p8(s) {  
        var p = (Math.random().toString(16)+"000000000").substr(2,8);  
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;  
     }  
     return _p8() + _p8(true) + _p8(true) + _p8();  
}
