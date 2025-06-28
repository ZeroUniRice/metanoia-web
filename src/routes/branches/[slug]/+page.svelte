<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { parseMarkdown } from '$lib/markdown.js';
	import { getBranchBySlug } from '$lib/branches.js';
	import { base } from '$app/paths';
	import type { Branch } from '$lib/types.js';

	let branch: Branch | null = $state(null);
	let loading = $state(true);

	// Generate a gradient background based on branch name
	function getBranchGradient(name: string): string {
		const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
		const hue1 = (hash * 137) % 360;
		const hue2 = (hue1 + 60) % 360;
		return `linear-gradient(135deg, hsl(${hue1}, 60%, 50%), hsl(${hue2}, 60%, 70%))`;
	}

	onMount(async () => {
		const slug = page.params.slug;
		try {
			branch = await getBranchBySlug(slug);
		} catch (error) {
			console.error('Failed to load branch:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{branch?.name || 'Branch'} - Metanoia</title>
	<meta name="description" content="Details about {branch?.name || 'research branch'}" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-6 py-8">
	<nav class="mb-8">
		<a
			href="{base}/branches"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
		>
			← Back to Projects
		</a>
	</nav>

	{#if loading}
		<div class="text-center text-gray-500 dark:text-gray-400">Loading branch content...</div>
	{:else if branch}
		<!-- Branch Header with CSS Banner -->
		<div
			class="relative mb-8 flex h-48 items-center justify-center rounded-lg text-white"
			style="background: {getBranchGradient(branch.name)}"
		>
			<div class="absolute inset-0 rounded-lg bg-black opacity-30"></div>
			<div class="relative z-10 px-6 text-center">
				<h1 class="mb-2 text-4xl font-bold">{branch.name}</h1>
				<p class="text-xl opacity-90">
					{branch.articleCount}
					{branch.articleCount === 1 ? 'Article' : 'Articles'}
				</p>
			</div>
		</div>

		<!-- Branch Content -->
		<div class="mb-12">
			<article class="prose dark:prose-invert max-w-none">
				{@html parseMarkdown(branch.content)}
			</article>
		</div>

		<!-- Articles Section -->
		{#if branch.articles.length > 0}
			<section>
				<h2 class="text-primary-dark dark:text-dark-text-header mb-8 text-3xl font-bold">
					Research Articles
				</h2>
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each branch.articles as article}
						<a
							href="{base}/branches/{branch.slug}/{article.slug}"
							class="block cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
						>
							{#if article.thumbnailPath}
								<img
									src="{base}{article.thumbnailPath}"
									alt="Thumbnail for {article.title}"
									class="h-48 w-full object-cover"
								/>
							{:else}
								<div
									class="flex h-48 w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
								>
									<span class="text-4xl text-gray-500 dark:text-gray-400">📄</span>
								</div>
							{/if}
							<div class="p-4">
								<h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
									{article.title}
								</h3>
								{#if article.authors.length > 0}
									<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
										By {article.authors.join(', ')}
									</p>
								{/if}
								<p class="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
									{@html parseMarkdown(article.abstract || 'No abstract available.')}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{:else}
			<div class="mt-12 text-center text-gray-500 dark:text-gray-400">
				<p class="text-lg">No articles available yet.</p>
				<p class="mt-2 text-sm">
					Articles will appear here as they are added to this research branch.
				</p>
			</div>
		{/if}
	{:else}
		<div class="text-center text-red-500 dark:text-red-400">
			<h1 class="mb-4 text-2xl font-bold">Branch Not Found</h1>
			<p>The requested research branch could not be found.</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
