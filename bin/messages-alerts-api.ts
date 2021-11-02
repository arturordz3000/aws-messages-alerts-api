#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MessagesAlertsApiStack } from '../lib/messages-alerts-api-stack';
import { ApiPipelineStack } from '../lib/messages-alerts-api-pipeline-stack';

const app = new cdk.App();

new ApiPipelineStack(app, 'ApiPipelineStack', {
  env: {
    account: '815673034358',
    region: 'us-east-2'
  }
});

app.synth();
