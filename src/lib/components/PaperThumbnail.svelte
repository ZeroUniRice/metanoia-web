<!-- Paper Thumbnail Component for IEEE Papers -->
<script lang="ts">
	import type { IEEEPaper } from '$lib/types.js';
	import { base } from '$app/paths';

	interface Props {
		paper: IEEEPaper;
		size?: 'small' | 'medium' | 'large';
		showAbstract?: boolean;
	}

	let { paper, size = 'medium', showAbstract = true }: Props = $props();

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + '...';
	}

	function formatAuthors(authors: string[]): string {
		if (authors.length === 0) return '';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
		if (authors.length <= 4) return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
		return `${authors[0]} et al.`;
	}

	function getPaperUrl(): string {
		// Generate URL based on paper title (you might want to use a unique ID instead)
		const paperSlug = paper.title.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '-')
			.substring(0, 50);
		return `${base}/papers/${paperSlug}`;
	}

	// Size configurations
	const sizeClasses = {
		small: {
			container: 'p-4',
			title: 'text-lg',
			authors: 'text-sm',
			abstract: 'text-sm',
			thumbnail: 'h-32',
			titleLines: 2,
			abstractLength: 100
		},
		medium: {
			container: 'p-6',
			title: 'text-xl',
			authors: 'text-base',
			abstract: 'text-sm',
			thumbnail: 'h-40',
			titleLines: 2,
			abstractLength: 150
		},
		large: {
			container: 'p-8',
			title: 'text-2xl',
			authors: 'text-lg',
			abstract: 'text-base',
			thumbnail: 'h-48',
			titleLines: 3,
			abstractLength: 200
		}
	};

	$: config = sizeClasses[size];
</script>

<article class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 group">
	<a href={getPaperUrl()} class="block {config.container}">
		<!-- Thumbnail Image (if available) -->
		{#if paper.thumbnailPath}
			<div class="mb-4">
				<img 
					src={paper.thumbnailPath} 
					alt="Paper thumbnail for {paper.title}"
					class="w-full {config.thumbnail} object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
					onerror="this.style.display='none'"
				/>
			</div>
		{:else}
			<!-- Default thumbnail with IEEE styling -->
			<div class="mb-4 {config.thumbnail} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-700">
				<div class="text-center">
					<svg class="w-8 h-8 mx-auto mb-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
					</svg>
					<span class="text-xs text-blue-600 dark:text-blue-300 font-medium">IEEE Paper</span>
				</div>
			</div>
		{/if}

		<!-- Paper Title -->
		<h3 class="{config.title} font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-{config.titleLines}">
			{paper.title}
		</h3>

		<!-- Authors -->
		<p class="{config.authors} text-gray-600 dark:text-gray-400 mb-3 font-medium">
			{formatAuthors(paper.authors)}
		</p>

		<!-- Conference & Year -->
		<div class="flex flex-wrap items-center gap-2 mb-3">
			{#if paper.conference}
				<span class="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
					{paper.conference.replace('IEEE', '').trim()}
				</span>
			{/if}
			{#if paper.year}
				<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
					{paper.year}
				</span>
			{/if}
		</div>

		<!-- Keywords -->
		{#if paper.keywords.length > 0}
			<div class="flex flex-wrap gap-1 mb-3">
				{#each paper.keywords.slice(0, 4) as keyword}
					<span class="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
						{keyword}
					</span>
				{/each}
				{#if paper.keywords.length > 4}
					<span class="text-xs text-gray-500 dark:text-gray-400">
						+{paper.keywords.length - 4} more
					</span>
				{/if}
			</div>
		{/if}

		<!-- Abstract (if enabled) -->
		{#if showAbstract && paper.abstract}
			<p class="{config.abstract} text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
				{truncateText(paper.abstract, config.abstractLength)}
			</p>
		{/if}

		<!-- Read More Button -->
		<div class="flex items-center justify-between">
			<span class="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
				Read Paper
				<svg class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</span>
			
			{#if paper.doi}
				<span class="text-xs text-gray-400 dark:text-gray-500 font-mono">
					DOI
				</span>
			{/if}
		</div>
	</a>
</article>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>