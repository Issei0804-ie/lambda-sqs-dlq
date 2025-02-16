# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Send message to sqs

```sh
aws sqs send-message \
--queue-url xxx \
--message-body "{\"status\":\"fail\",\"message\":\"hello\"}" \
--message-group-id "MyGroupId" \
--message-deduplication-id "UniqueDeduplicationId7"
```
