import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import dotenv from 'dotenv';

dotenv.config();


export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY)
	   },

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
