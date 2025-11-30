export interface Renderer {
	render(content: string): Promise<Blob>;
}
