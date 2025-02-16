import * as Lambda from 'aws-lambda';
import axios from 'axios';

export async function handler(event: Lambda.CloudWatchAlarmEvent) {
	const webhookUrl = process.env.SLACK_WEBHOOK_URL;

	if (!webhookUrl) {
		throw new Error('fail....');
	}

	const slackMessage = {
		text: 'sample',
	};

    await axios.post(webhookUrl, slackMessage);
}