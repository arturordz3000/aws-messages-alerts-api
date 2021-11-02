import * as cdk from '@aws-cdk/core';
import { MessagesAlertsApiStack } from './messages-alerts-api-stack';

export class MessageAlertsApiStage extends cdk.Stage {
    
    constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);
  
      const lambdaStack = new MessagesAlertsApiStack(this, 'MessagesAlertsApiStack');      
    }
}
