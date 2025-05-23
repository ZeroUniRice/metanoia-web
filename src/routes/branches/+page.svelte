<script lang="ts">
	import { onMount } from 'svelte';
	import type { BranchSummary } from '$lib/types.js';
	import { loadBranches } from '$lib/branches.js';
	import BranchCard from '$lib/components/BranchCard.svelte';
	import { base } from '$app/paths';

	let branches: BranchSummary[] = $state([]);

	onMount(async () => {
		branches = await loadBranches();
	});
</script>

<svelte:head>
	<title>Projects - Metanoia</title>
	<meta name="description" content="All research projects and branches at Metanoia." />
</svelte:head>

<div class="container mx-auto max-w-6xl py-12 px-8">	<nav class="mb-8">
		<a 
			href="{base}/"
			class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
		>
			← Back to Home
		</a>
	</nav>

	<h1 class="text-4xl font-bold mb-8 text-primary-dark dark:text-dark-text-header">
		Research Projects
	</h1>
	
	<p class="text-lg text-neutral-primary mb-12 max-w-3xl">
		Explore our current research initiatives.
	</p>

	<div class="grid md:grid-cols-2 gap-10">
		{#each branches as branch}
			<BranchCard {branch} />
		{/each}
	</div>
	
	{#if branches.length === 0}
		<div class="text-gray-500 dark:text-gray-400 mt-8 text-center">
			Loading projects...
		</div>
	{/if}
</div>
