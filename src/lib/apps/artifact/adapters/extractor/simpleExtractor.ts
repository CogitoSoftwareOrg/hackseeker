import z from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import { grok, LLMS } from '$lib/shared/server';

import { ExtractorResultSchema, type Extractor } from '../../core';

const EXTRACTOR_MODEL = LLMS.GROK_4_1_FAST_NON_REASONING;
const EXTRACTOR_MAX_CHARS = 15000;

const EXTRACTOR_SYSTEM_PROMPT = `
You are an expert content analyzer. Your task is to extract structured information from web content to help validate business pain points.

Given a markdown document from a web page, extract the following:

1. **Quotes**: Direct quotes from real users expressing frustrations, complaints, or pain points. Include the author if identifiable.
2. **Insights**: Key observations about problems, market trends, or user behavior patterns.
3. **Competitors**: Existing tools, products, or solutions mentioned that address similar problems. Include their names, descriptions, and links if available.
4. **Hacks**: DIY solutions, workarounds, or manual processes people use to solve the problem without a proper tool.

Be selective and only extract high-quality, relevant information. If the content doesn't contain relevant information for a category, return an empty array for that category.
Focus on extracting information that helps validate whether a problem is real, significant, and worth solving.`;

/**
 * Strips markdown code blocks from LLM response (e.g., ```json ... ```)
 */
function stripMarkdownCodeBlocks(content: string): string {
	const trimmed = content.trim();
	// Match ```json or ``` at start, and ``` at end
	const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
	const match = trimmed.match(codeBlockRegex);
	return match ? match[1].trim() : trimmed;
}

export class SimpleExtractor implements Extractor {
	async extract(markdown: string): Promise<z.infer<typeof ExtractorResultSchema>> {
		if (!markdown || markdown.trim().length === 0) {
			console.log('Empty markdown content, skipping extraction');
			return {
				quotes: [],
				insights: [],
				competitors: [],
				hacks: []
			};
		}

		const truncatedMarkdown =
			markdown.length > EXTRACTOR_MAX_CHARS
				? markdown.slice(0, EXTRACTOR_MAX_CHARS) + '\n\n[Content truncated...]'
				: markdown;

		try {
			const res = await grok.chat.completions.create({
				model: EXTRACTOR_MODEL,
				messages: [
					{ role: 'system', content: EXTRACTOR_SYSTEM_PROMPT },
					{
						role: 'user',
						content: `Extract structured information from this web content:\n\n${truncatedMarkdown}`
					}
				],
				response_format: zodResponseFormat(ExtractorResultSchema, 'extraction_result'),
				stream: false
			});

			const content = res.choices[0]?.message?.content;
			if (!content) {
				console.warn('No content in LLM response');
				return { quotes: [], insights: [], competitors: [], hacks: [] };
			}

			// Strip markdown code blocks if present (Grok sometimes wraps JSON in ```json ... ```)
			const cleanContent = stripMarkdownCodeBlocks(content);
			const parsed = JSON.parse(cleanContent);
			const validated = ExtractorResultSchema.parse(parsed);

			console.log(
				`Extracted: ${validated.quotes.length} quotes, ${validated.insights.length} insights, ` +
					`${validated.competitors.length} competitors, ${validated.hacks.length} hacks`
			);

			return validated;
		} catch (error) {
			console.error('Error extracting from markdown:', error);
			return {
				quotes: [],
				insights: [],
				competitors: [],
				hacks: []
			};
		}
	}
}
