exports.constants = {
    tables: {
        events: 'Events'
    },
    index: {
        messageType: 'message_type'
    },
    types: {
        message: 'message',
        alert: 'alert'
    },
    eventBusName: 'messages-alerts-event-bus',
    region: process.env.REGION,
    slackToken: process.env.SLACK_TOKEN,
    bucketName: `messages-bucket-815673034358`,
    swaggerBucketName: 'swagger-bucket-815673034358'
};