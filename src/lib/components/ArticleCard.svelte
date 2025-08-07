<script lang="ts">
	import type { Article } from '$lib/types';
	import { base } from '$app/paths';
	import { timeAgo } from '$lib/utils';

	interface Props {
		article: Article;
	}

	let { article }: Props = $props();
</script>

<a
	href="{base}{article.route}"
	class="group block overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 hover:border-primary-light dark:hover:border-primary-default"
>
	<div class="relative h-48 w-full">
		{#if article.thumbnailPath}
			<img
				src="{base}{article.thumbnailPath}"
				alt="Thumbnail for {article.title}"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
			>
				<span class="text-4xl text-gray-500 dark:text-gray-400">📄</span>
			</div>
		{/if}
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
		></div>
		<div class="absolute bottom-0 left-0 p-4">
			<p class="mb-1 text-sm font-semibold text-white drop-shadow-md">{article.branchName}</p>
			<h3
				class="line-clamp-2 text-lg font-bold text-white drop-shadow-md transition-colors group-hover:text-secondary-light"
			>
				{article.title}
			</h3>
		</div>
	</div>
	<div class="p-4">
		{#if article.authors.length > 0}
			<p class="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
				By {article.authors.join(', ')}
			</p>
		{/if}
		<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
			<span>{new Date(article.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
			<span>{timeAgo(article.publicationDate)}</span>
		</div>
	</div>
</a>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>