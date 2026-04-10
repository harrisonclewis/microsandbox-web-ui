import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		experimental: {
			async: true
		},
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		experimental: {
			remoteFunctions: true
		},
		adapter: adapter()
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
