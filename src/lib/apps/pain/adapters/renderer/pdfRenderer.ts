import { Chromiumly, HtmlConverter } from 'chromiumly';
import { env } from '$env/dynamic/private';

import type { Renderer } from '../../core';

Chromiumly.configure({
	endpoint: env.GOTENBERG_URL,
	username: env.GOTENBERG_USER,
	password: env.GOTENBERG_PASSWORD
});

export class PdfRenderer implements Renderer {
	async render(content: string): Promise<Blob> {
		console.log('content length', content.length);

		const htmlConverter = new HtmlConverter();

		const buffer = await htmlConverter.convert({
			html: Buffer.from(content, 'utf-8'),
			properties: {
				printBackground: true,
				margins: {
					top: 0.79, // ~20 мм
					right: 0.59, // ~15 мм
					bottom: 0.79,
					left: 0.59
				}
			}
		});

		return new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
	}
}
