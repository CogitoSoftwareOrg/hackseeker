import { chromium } from 'playwright';
import fs from 'fs';

import type { Renderer } from '../../core';

export class PdfRenderer implements Renderer {
	async render(content: string): Promise<Blob> {
		const browser = await chromium.launch();
		const page = await browser.newPage();

		await page.setContent(content, { waitUntil: 'networkidle' });

		await page.pdf({
			path: 'result.pdf',
			format: 'A4',
			printBackground: true,
			margin: {
				top: '20mm',
				right: '15mm',
				bottom: '20mm',
				left: '15mm'
			}
		});

		await browser.close();

		const buffer = await fs.promises.readFile('result.pdf');
		return new Blob([buffer], { type: 'application/pdf' });
	}
}
