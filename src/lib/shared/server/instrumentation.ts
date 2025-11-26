import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { env } from '$env/dynamic/private';

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
	publicKey: env.LANGFUSE_PUBLIC_KEY,
	secretKey: env.LANGFUSE_SECRET_KEY,
	environment: env.ENV,
	baseUrl: env.LANGFUSE_BASE_URL
});

const sdk = new NodeSDK({
	spanProcessors: [langfuseSpanProcessor]
});

sdk.start();
