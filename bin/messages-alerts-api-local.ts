#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MessagesAlertsApiStack } from '../lib/messages-alerts-api-stack';

const app = new cdk.App();

new MessagesAlertsApiStack(app, 'MessagesAlertsApiStack', {
  env: {
    account: '815673034358',
    region: 'us-east-2'
  }
});

app.synth();
