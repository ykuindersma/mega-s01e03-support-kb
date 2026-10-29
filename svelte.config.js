import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const layout = (name) => fileURLToPath(new URL(`./src/lib/layouts/${name}.svelte`, import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: layout('runbook') } })],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['*'] },
  },
};
