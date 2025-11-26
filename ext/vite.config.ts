import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

import manifest from './manifest.ts';

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), svelte(), crx({ manifest })],
	publicDir: path.resolve(__dirname, '../static'),
	resolve: {
		alias: {
			$src: path.resolve(__dirname, '../src'),
			$lib: path.resolve(__dirname, '../src/lib')
		}
	},
	build: {
		target: 'es2022'
	}
});
