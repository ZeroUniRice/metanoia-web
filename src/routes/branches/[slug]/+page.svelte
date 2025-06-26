<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { parseMarkdown } from '$lib/markdown.js';	import { getBranchBySlug } from '$lib/branches.js';
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

<div class="container mx-auto max-w-6xl py-8 px-6">
	<nav class="mb-8">
		<a 
			href="{base}/branches"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
		>
			← Back to Projects
		</a>
	</nav>

	{#if loading}
		<div class="text-center text-gray-500 dark:text-gray-400">
			Loading branch content...
		</div>
	{:else if branch}
		<!-- Branch Header with CSS Banner -->
		<div 
			class="h-48 mb-8 rounded-lg relative flex items-center justify-center text-white"
			style="background: {getBranchGradient(branch.name)}"
		>
			<div class="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
			<div class="relative z-10 text-center px-6">
				<h1 class="text-4xl font-bold mb-2">{branch.name}</h1>
				<p class="text-xl opacity-90">{branch.articleCount} {branch.articleCount === 1 ? 'Article' : 'Articles'}</p>
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
				<h2 class="text-3xl font-bold mb-8 text-primary-dark dark:text-dark-text-header">
					Research Articles
				</h2>				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each branch.articles as article}
						<a 
							href="{base}/branches/{branch.slug}/{article.slug}"
							class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow text-left block"
						>
							{#if article.thumbnailPath}
								<img 
									src="{base}{article.thumbnailPath}" 
									alt="Thumbnail for {article.title}"
									class="w-full h-48 object-cover"
								/>
							{:else}
								<div class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
									<span class="text-gray-500 dark:text-gray-400 text-4xl">📄</span>
								</div>
							{/if}
							<div class="p-4">
								<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
									{article.title}
								</h3>
								{#if article.authors.length > 0}
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
										By {article.authors.join(', ')}
									</p>
								{/if}
								<p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
									{@html parseMarkdown(article.abstract || 'No abstract available.')}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{:else}
			<div class="text-center text-gray-500 dark:text-gray-400 mt-12">
				<p class="text-lg">No articles available yet.</p>
				<p class="text-sm mt-2">Articles will appear here as they are added to this research branch.</p>
			</div>
		{/if}
	{:else}
		<div class="text-center text-red-500 dark:text-red-400">
			<h1 class="text-2xl font-bold mb-4">Branch Not Found</h1>
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
