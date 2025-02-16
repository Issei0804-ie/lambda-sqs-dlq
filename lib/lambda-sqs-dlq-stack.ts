import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import 'dotenv/config'

export class LambdaSqsDlqStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGroup = new cdk.aws_logs.LogGroup(this, 'sandbox-log-group', {
      logGroupName: 'sandbox-lambda-log-group',
      retention: cdk.aws_logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const filter = logGroup.addMetricFilter('metric-filter', {
      filterPattern: {
        logPatternString: "%ERROR%"
      },
      metricNamespace: 'ErrorMetrics',
      metricName: 'ErrorCount'
    });

    const alarm = new cdk.aws_cloudwatch.Alarm(this, 'error-alarm', {
      metric: filter.metric(),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1
    });

    const deadLetterQueue = new sqs.Queue(this, 'dead-letter-queue', {
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: cdk.Duration.seconds(30),
      fifo: true,
    });

    const queue = new sqs.Queue(this, 'fifo-queue', {
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: cdk.Duration.seconds(30),
      fifo: true,
      deadLetterQueue: {
       maxReceiveCount: 3,
       queue: deadLetterQueue, 
      }
    });

    const subscriber = new NodejsFunction(this, 'lambda', {
      entry: path.join(__dirname, '../', 'lambda', 'index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      logGroup: logGroup,
    });

    subscriber.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(queue));

    const alarmLambda = new NodejsFunction(this, 'alarm-lambda', {
      entry: path.join(__dirname, '../', 'notify-slack-lambda', 'index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL ?? '',
      },
    });

    alarm.addAlarmAction(new cdk.aws_cloudwatch_actions.LambdaAction(alarmLambda));
  }
}
