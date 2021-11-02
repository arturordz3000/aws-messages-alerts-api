#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import * as codecommit from '@aws-cdk/aws-codecommit';
import { CodePipeline, CodePipelineSource, ShellStep } from '@aws-cdk/pipelines';
import { MessageAlertsApiStage } from './message-alerts-api-stage';


export class ApiPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = codecommit.Repository.fromRepositoryName(this, 'Repository', 'messages-alerts-api');

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MessagesAlertsApiPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.codeCommit(repository, 'master'),
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            })
        });

        pipeline.addStage(new MessageAlertsApiStage(this, "Api", {
            env: props?.env
        }));
    }
}