import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { EventBus, Rule, RuleTargetInput, EventField } from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as origins from '@aws-cdk/aws-cloudfront-origins';
const constants = require('../lambdas/my-constants').constants;

export class MessagesAlertsApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getMessagesLambda = new lambda.Function(this, 'GetMessagesHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'get-messages.handler'
    });

    const putMessageLambda = new lambda.Function(this, 'PutMessageHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'put-message.handler'
    });

    const getAlertsLambda = new lambda.Function(this, 'GetAlertsHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'get-alerts.handler'
    });

    const putAlertLambda = new lambda.Function(this, 'PutAlertHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'put-alert.handler'
    });

    const enqueueEventLambda = new lambda.Function(this, 'EnqueueEventHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'enqueue-event.handler'
    });

    const table = new dynamodb.Table(this, "OrdersTable", {
      tableName: constants.tables.events,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'creation_date', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: constants.index.messageType,
      partitionKey: { name: 'type', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'creation_date', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    table.grantReadData(getMessagesLambda);
    table.grantWriteData(putMessageLambda);
    table.grantReadData(getAlertsLambda);
    table.grantWriteData(putAlertLambda);
    
    const api = new apigateway.RestApi(this, "api", {
      restApiName: "messages-alerts-api",
      defaultCorsPreflightOptions: {
        allowOrigins: ['*']
      }      
    });

    const messages = api.root.addResource('messages');
    const getMessagesIntegration = new apigateway.LambdaIntegration(getMessagesLambda);
    const putMessageIntegration = new apigateway.LambdaIntegration(putMessageLambda);
    messages.addMethod('GET', getMessagesIntegration);
    messages.addMethod('PUT', putMessageIntegration);

    const alerts = api.root.addResource('alerts');
    const getAlertsIntegration = new apigateway.LambdaIntegration(getAlertsLambda);
    const putAlertIntegration = new apigateway.LambdaIntegration(putAlertLambda);
    alerts.addMethod('GET', getAlertsIntegration);
    alerts.addMethod('PUT', putAlertIntegration);

    const events = api.root.addResource('events');
    const putEventIntegration = new apigateway.LambdaIntegration(enqueueEventLambda);
    events.addMethod('PUT', putEventIntegration);

    const bus = new EventBus(this, 'EventBus', {
      eventBusName: constants.eventBusName
    });

    const messageEventsRule = new Rule(this, 'MessageEventsRule', {
      ruleName: 'message-events-rule',
      description: 'Rule for message events',
      eventBus: bus,
      eventPattern: {
        detailType: [constants.types.message]
      }
    });

    const alertEventsRule = new Rule(this, 'AlertEventsRule', {
      ruleName: 'alert-events-rule',
      description: 'Rule for alert events',
      eventBus: bus,
      eventPattern: {
        detailType: [constants.types.alert]
      }
    });

    messageEventsRule.addTarget(new targets.LambdaFunction(putMessageLambda));
    alertEventsRule.addTarget(new targets.LambdaFunction(putAlertLambda));

    bus.grantPutEventsTo(enqueueEventLambda);

    const s3Bucket = new s3.Bucket(this, constants.bucketName, { bucketName: constants.bucketName });
    s3Bucket.grantReadWrite(putMessageLambda);

    const swaggerBucket = new s3.Bucket(this, constants.swaggerBucketName, {
      bucketName: constants.swaggerBucketName,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,        
      websiteIndexDocument: "index.html"
    });

    new cloudfront.Distribution(this, 'swaggerDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(swaggerBucket) },
    });

    const deployment = new s3Deployment.BucketDeployment(this, "deploySwaggerWebsite", {
      sources: [s3Deployment.Source.asset("swagger-ui")],
      destinationBucket: swaggerBucket
    });
  }
}
