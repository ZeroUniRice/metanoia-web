<script lang="ts">
	import { onMount } from 'svelte';
	import type { Branch } from '$lib/types.js';
	import { loadBranches } from '$lib/branches.js';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';

	let branches: Branch[] = $state([]);

	onMount(async () => {
		branches = await loadBranches();
	});
</script>

<svelte:head>
	<title>Projects - Metanoia</title>
	<meta name="description" content="All research projects and branches at Metanoia." />
</svelte:head>

<div class="container mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
	<nav class="mb-8">
		<a
			href="{base}/"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
		>
			← Back to Home
		</a>
	</nav>

	<div class="mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
		<h1 class="text-4xl md:text-5xl font-bold text-primary-dark dark:text-dark-text-header mb-4">
			Research Projects
		</h1>
		<p class="text-lg text-neutral-primary max-w-3xl">
			Explore our current research initiatives, each with a unique focus and set of publications.
		</p>
	</div>

	{#if branches.length > 0}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
			{#each branches as branch}
				<a
					href="{base}{branch.route}"
					class="group flex flex-col rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
				>
					<!-- Image Header -->
					<div
						class="relative h-56 flex-shrink-0 bg-cover bg-center"
						style="background-image: url('{base}{branch.standardImage || ''}');"
					>
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
						<div class="absolute bottom-0 left-0 p-6">
							<h2 class="text-3xl font-bold text-white drop-shadow-lg">{branch.name}</h2>
						</div>
					</div>

					<!-- Content Body -->
					<div class="flex flex-grow flex-col p-6">
						<div
							class="prose dark:prose-invert max-w-none flex-grow text-gray-600 dark:text-gray-300 mb-6"
						>
							{@html parseMarkdown(branch.content)}
						</div>
						<div
							class="mt-auto flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700"
						>
							<span class="font-semibold text-primary-default dark:text-primary-light">
								{branch.articleCount} {branch.articleCount === 1 ? 'Article' : 'Articles'}
							</span>
							<span
								class="font-bold text-gray-700 opacity-70 transition-opacity group-hover:opacity-100 dark:text-gray-200"
							>
								View Project →
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="text-gray-500 dark:text-gray-400 mt-8 text-center">
			Loading projects...
		</div>
	{/if}
</div>
