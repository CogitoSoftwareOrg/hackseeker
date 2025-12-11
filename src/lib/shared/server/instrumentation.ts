import { NodeSDK } from '@opentelemetry/sdk-node';

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';

import { LangfuseSpanProcessor } from '@langfuse/otel';

import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const sdk = new NodeSDK({
	resource: resourceFromAttributes({
		'service.name': 'hackseeker'
	}),
	logRecordProcessor: new BatchLogRecordProcessor(
		new OTLPLogExporter({
			url: 'https://eu.i.posthog.com/i/v1/logs',
			headers: {
				Authorization: `Bearer ${publicEnv.PUBLIC_POSTHOG_TOKEN}`
			}
		})
	),
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
