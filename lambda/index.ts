import * as Lambda from 'aws-lambda';

type SQSBody = {
	status: 'success' | 'fail';
	message: string;
}

export function handler(event: Lambda.SQSEvent) {
	
	for (const message of event.Records) {
		// あとでいい感じに型にしてほしい
		const body = JSON.parse(message.body) as SQSBody;

		if (body.status === 'fail') {
			// dlqに移動させる
			throw new Error('fail!!');
		}
		console.log('a');
		console.log(`status: ${body.status}, message: ${body.message}`);
	}
}
