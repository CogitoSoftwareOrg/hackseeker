import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { env } from '$env/dynamic/private';

const sdk = new NodeSDK({
	spanProcessors: [
		new LangfuseSpanProcessor({
			publicKey: env.LANGFUSE_PUBLIC_KEY,
			baseUrl: env.LANGFUSE_BASE_URL,
			secretKey: env.LANGFUSE_SECRET_KEY,
			environment: env.ENV
		})
	]
});

sdk.start();
