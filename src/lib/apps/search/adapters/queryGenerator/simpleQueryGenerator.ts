import z from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import { SearchQueriesTypeOptions } from '$lib/shared';
import { grok, LLMS } from '$lib/shared/server';

import { QueryGeneratorSchema, type QueryGenerator } from '../../core';

const QUERY_GENERATOR_MODEL = LLMS.GROK_4_1_FAST_NON_REASONING;

const QUERY_GENERATOR_SYSTEM_PROMPT = `
You are a market research expert. Your task is to generate strategic search queries for validating business pain points.

Given information about a pain point (segment, problem, job-to-be-done, keywords), generate 5-8 diverse search queries designed to find:

1. **problemDiscovery** - Queries to find people discussing this problem online (forums, Reddit, communities)
2. **solutionTools** - Queries to find existing tools/products solving similar problems
3. **diyHacks** - Queries to find workarounds, spreadsheets, or manual solutions people use
4. **comparisonListicles** - Queries to find "best X tools" or comparison articles
5. **communityPain** - Queries for community discussions about frustrations with current solutions
6. **communitySolutions** - Queries for community-shared solutions or recommendations
7. **launchExamples** - Queries to find similar product launches or case studies

Generate queries that would work well on search engines and return relevant results. Make them specific enough to find valuable content but broad enough to return results.

Each query should be a natural search phrase, not a keyword list.`;

/**
 * Strips markdown code blocks from LLM response (e.g., ```json ... ```)
 */
function stripMarkdownCodeBlocks(content: string): string {
	const trimmed = content.trim();
	const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
	const match = trimmed.match(codeBlockRegex);
	return match ? match[1].trim() : trimmed;
}

export class SimpleQueryGenerator implements QueryGenerator {
	async generate(prompt: string): Promise<z.infer<typeof QueryGeneratorSchema>> {
		try {
			const res = await grok.chat.completions.create({
				model: QUERY_GENERATOR_MODEL,
				messages: [
					{ role: 'system', content: QUERY_GENERATOR_SYSTEM_PROMPT },
					{
						role: 'user',
						content: `Generate search queries for validating this pain point:\n\n${prompt}`
					}
				],
				response_format: zodResponseFormat(QueryGeneratorSchema, 'search_queries'),
				stream: false
			});

			const content = res.choices[0]?.message?.content;
			if (!content) {
				console.warn('No content in LLM response, using fallback');
				return {
					queries: [{ query: prompt, type: SearchQueriesTypeOptions.general }]
				};
			}

			// Strip markdown code blocks if present (Grok sometimes wraps JSON in ```json ... ```)
			const cleanContent = stripMarkdownCodeBlocks(content);
			const parsed = JSON.parse(cleanContent);
			const validated = QueryGeneratorSchema.parse(parsed);

			console.log(`Generated ${validated.queries.length} search queries`);
			return validated;
		} catch (error) {
			console.error('Error generating search queries:', error);
			return {
				queries: [{ query: prompt, type: SearchQueriesTypeOptions.general }]
			};
		}
	}
}
