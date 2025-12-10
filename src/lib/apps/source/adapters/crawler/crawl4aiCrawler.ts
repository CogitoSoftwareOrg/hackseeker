import { env } from '$env/dynamic/private';
import type { Crawler, CrawlResult } from '../../core';

export type Crawl4aiResult = {
	url: string;
	html: string;
	markdown: string;
	success: boolean;
	error_message: string;
	status_code: number;
	metadata: Record<string, unknown>;
};

export class Crawl4aiCrawler implements Crawler {
	constructor() {}

	async crawl(urls: string[]): Promise<CrawlResult[]> {
		const credentials = `Basic ${Buffer.from(`${env.CRAWL4AI_USER}:${env.CRAWL4AI_API_KEY}`).toString('base64')}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Authorization: credentials
		};

		const response = await fetch(`${env.CRAWL4AI_URL}/crawl`, {
			method: 'POST',
			body: JSON.stringify({ urls }),
			headers
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(
				`Failed to crawl via Crawl4AI: ${response.status} ${response.statusText} ${text}`
			);
		}
		const json = await response.json();
		if (!json.success) {
			throw new Error(`Failed to crawl via Crawl4AI: ${json.message}`);
		}

		const rawResults = json.results as Crawl4aiResult[];
		return rawResults;
	}
}
