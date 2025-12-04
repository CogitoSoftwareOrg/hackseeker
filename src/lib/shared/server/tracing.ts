import { updateActiveTrace } from '@langfuse/tracing';

export function streamWithTracing(
	stream: ReadableStream,
	options?: {
		updateInterval?: number; // Update metadata every N chunks (default: 10)
		onChunk?: (chunkCount: number) => Record<string, unknown>; // Custom metadata per chunk
		onComplete?: (chunkCount: number) => Record<string, unknown>; // Custom metadata on completion
		onError?: (error: unknown) => Record<string, unknown>; // Custom metadata on error
	}
): ReadableStream {
	const updateInterval = options?.updateInterval ?? 10;

	return new ReadableStream({
		async start(controller) {
			const reader = stream.getReader();
			let chunkCount = 0;

			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					chunkCount++;
					if (chunkCount % updateInterval === 0) {
						const metadata = options?.onChunk ? options.onChunk(chunkCount) : { chunkCount };
						updateActiveTrace({ metadata });
					}

					controller.enqueue(value);
				}
				controller.close();
			} catch (error) {
				controller.error(error);
				const errorMetadata = options?.onError
					? options.onError(error)
					: { error: error instanceof Error ? error.message : 'Unknown error' };
				updateActiveTrace({ metadata: errorMetadata });
			} finally {
				reader.releaseLock();
				// Update trace with final metadata after stream completes
				const finalMetadata = options?.onComplete
					? options.onComplete(chunkCount)
					: { totalChunks: chunkCount };
				updateActiveTrace({ metadata: finalMetadata });
			}
		}
	});
}
