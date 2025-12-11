import { SentenceSplitter, type TextNode, type Metadata } from 'llamaindex';
import { PDFReader } from '@llamaindex/readers/pdf';
import { DocxReader } from '@llamaindex/readers/docx';
import { CSVReader } from '@llamaindex/readers/csv';
import { HTMLReader } from '@llamaindex/readers/html';
import { ImageReader } from '@llamaindex/readers/image';
import { JSONReader } from '@llamaindex/readers/json';
import { MarkdownReader } from '@llamaindex/readers/markdown';
import { TextFileReader } from '@llamaindex/readers/text';

import { Collections, pb, type ChunksResponse, type SourcesResponse } from '$lib/shared';
import { countTokens } from '$lib/shared/server';

import type { Normalizer } from '../../core';

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 50;

export class LlamaNormilizer implements Normalizer {
	private pdf: PDFReader;
	private docx: DocxReader;
	private html: HTMLReader;
	private image: ImageReader;
	private json: JSONReader;
	private markdown: MarkdownReader;
	private csv: CSVReader;
	private splitter: SentenceSplitter;
	private text: TextFileReader;

	constructor() {
		this.pdf = new PDFReader();
		this.docx = new DocxReader();
		this.html = new HTMLReader();
		this.image = new ImageReader();
		this.json = new JSONReader();
		this.markdown = new MarkdownReader();
		this.csv = new CSVReader();
		this.text = new TextFileReader();

		this.splitter = new SentenceSplitter({
			chunkSize: CHUNK_SIZE,
			chunkOverlap: CHUNK_OVERLAP
		});
	}

	async normalize(source: SourcesResponse, file: File): Promise<ChunksResponse[]> {
		const reader = this.matchReader(file);

		const arrayBuffer = await file.arrayBuffer();
		const documents = await reader.loadDataAsContent(new Uint8Array(arrayBuffer));

		const nodes = await this.splitter.getNodesFromDocuments(documents);

		const chunks = await this.toChunks(nodes, source);
		return chunks;
	}

	private async toChunks(
		nodes: TextNode<Metadata>[],
		source: SourcesResponse
	): Promise<ChunksResponse[]> {
		const chunks = await Promise.all(
			nodes.map(async (node) => {
				const content = node.getContent();
				if (!content) return null;

				const dto = {
					source: source.id,
					content: content,
					tokens: countTokens(content),
					metadata: node.metadata
				};
				return await pb.collection(Collections.Chunks).create(dto);
			})
		);

		return chunks.filter((chunk) => chunk !== null);
	}

	private matchReader(file: File) {
		if (file.name.endsWith('.pdf')) {
			return this.pdf;
		} else if (file.name.endsWith('.docx')) {
			return this.docx;
		} else if (file.name.endsWith('.html')) {
			return this.html;
		} else if (this.isImage(file)) {
			return this.image;
		} else if (file.name.endsWith('.json')) {
			return this.json;
		} else if (file.name.endsWith('.csv')) {
			return this.csv;
		} else if (file.name.endsWith('.md')) {
			return this.markdown;
		} else if (file.name.endsWith('.txt')) {
			return this.text;
		}

		throw new Error('Unsupported file type');
	}

	private isImage(file: File) {
		return (
			file.name.endsWith('.png') ||
			file.name.endsWith('.jpg') ||
			file.name.endsWith('.jpeg') ||
			file.name.endsWith('.gif') ||
			file.name.endsWith('.bmp') ||
			file.name.endsWith('.tiff') ||
			file.name.endsWith('.ico') ||
			file.name.endsWith('.webp')
		);
	}
}
