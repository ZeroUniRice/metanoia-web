<script lang="ts">
	import { onMount } from 'svelte';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';

	let content = $state('');
	let loading = $state(true);
	onMount(async () => {
		try {
			const response = await fetch(`${base}/branches/branch1/summary.txt`);
			if (response.ok) {
				const text = await response.text();
				const contentMatch = text.match(/\[CONTENT\]\s*([\s\S]*)/);
				content = contentMatch ? contentMatch[1].trim() : text;
			}
		} catch (error) {
			console.error('Failed to load branch content:', error);
			content = 'Failed to load content.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Branch 1 - Metanoia</title>
	<meta name="description" content="Details about Branch 1 project" />
</svelte:head>

<div class="container mx-auto max-w-4xl py-8 px-6">	<nav class="mb-8">
		<a 
			href="{base}/"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
		>
			← Back to Home
		</a>
	</nav>

	{#if loading}
		<div class="text-center text-gray-500 dark:text-gray-400">
			Loading content...
		</div>
	{:else}
		<article class="prose dark:prose-invert max-w-none">
			{@html parseMarkdown(content)}
		</article>
	{/if}
</div>
