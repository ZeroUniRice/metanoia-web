<script lang="ts">
	import { onMount } from 'svelte';
	import branchData from '$lib/branchData.js';
	import type { Article } from '$lib/types.js';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import { base } from '$app/paths';

	let allArticles: Article[] = $state([]);
	let displayedArticles: Article[] = $state([]);
	let loading = $state(true);
	let page = $state(1);
	const articlesPerPage = 9;
	let sentinel: HTMLDivElement | undefined = $state();

	function loadAllArticles() {
		const articles = branchData.flatMap(branch => branch.articles);
		articles.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
		allArticles = articles;
	}

	function loadMoreArticles() {
		if (loading || displayedArticles.length >= allArticles.length) return;
		
		loading = true;
		const nextPage = page + 1;
		const nextArticles = allArticles.slice(0, nextPage * articlesPerPage);
		
		// Simulate network delay for better UX
		setTimeout(() => {
			displayedArticles = nextArticles;
			page = nextPage;
			loading = false;
		}, 300);
	}

	onMount(() => {
		loadAllArticles();
		displayedArticles = allArticles.slice(0, articlesPerPage);
		loading = false;

		const observer = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting) {
				loadMoreArticles();
			}
		}, {
			rootMargin: '200px'
		});

		if (sentinel) {
			observer.observe(sentinel);
		}

		return () => {
			if (sentinel) {
				observer.unobserve(sentinel);
			}
		};
	});
</script>

<svelte:head>
	<title>All Papers - Metanoia</title>
	<meta name="description" content="Browse all research papers from Metanoia." />
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
			Research Papers
		</h1>
		<p class="text-lg text-neutral-primary max-w-3xl">
			Explore our complete collection of research papers, sorted from newest to oldest.
		</p>
	</div>

	{#if displayedArticles.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each displayedArticles as article (article.route)}
				<div class="animate-fade-in">
					<ArticleCard {article} />
				</div>
			{/each}
		</div>
	{:else if !loading}
		<div class="text-center py-16">
			<p class="text-gray-500 dark:text-gray-400">No research papers found.</p>
		</div>
	{/if}

	<!-- Loading Sentinel -->
	{#if displayedArticles.length < allArticles.length}
		<div bind:this={sentinel} class="h-10"></div>
		{#if loading}
			<div class="flex justify-center items-center py-8 space-x-2">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-default"></div>
				<span class="text-gray-600 dark:text-gray-400">Loading more papers...</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
	}
</style>
