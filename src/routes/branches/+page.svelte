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

<div class="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
	<nav class="mb-10">
		<a
			href="{base}/"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
		>
			← Back to Home
		</a>
	</nav>

	<div class="mb-16 text-center">
		<h1 class="text-4xl md:text-6xl font-extrabold text-primary-dark dark:text-dark-text-header mb-4">
			Our Research Pillars
		</h1>
		<p class="text-lg md:text-xl text-neutral-primary max-w-3xl mx-auto">
			Our work is organized into two core branches, each driving innovation in its respective field.
		</p>
	</div>

	{#if branches.length > 0}
		<div class="space-y-16">
			{#each branches as branch, i}
				<section class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-center">
					<!-- Image Column -->
					<div
						class="relative min-h-[300px] lg:min-h-[400px] rounded-2xl bg-cover bg-center group {i % 2 !== 0 ? 'lg:order-last' : ''}"
						style="background-image: url('{base}{branch.standardImage || ''}');"
					>
						<a href="{base}{branch.route}" class="absolute inset-0" aria-label="View {branch.name} project"></a>
					</div>

					<!-- Content Column -->
					<div class="py-8 text-center lg:text-left lg:py-0">
						<h2 class="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
							{branch.name}
						</h2>
						<div
							class="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8"
						>
							{@html parseMarkdown(branch.content)}
						</div>
						<div
							class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
						>
							<div class="text-2xl font-bold text-primary-default dark:text-primary-light">
								{branch.articleCount}
								<span class="text-base font-medium text-gray-500 dark:text-gray-400 ml-1"
									>{branch.articleCount === 1 ? 'Publication' : 'Publications'}</span
								>
							</div>
							<a
								href="{base}{branch.route}"
								class="inline-block bg-primary-default hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
							>
								Explore Project
							</a>
						</div>
					</div>
				</section>
				{#if i < branches.length - 1}
					<div class="py-8">
						<hr class="border-gray-200 dark:border-gray-700" />
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="text-gray-500 dark:text-gray-400 mt-8 text-center">
			Loading projects...
		</div>
	{/if}
</div>
