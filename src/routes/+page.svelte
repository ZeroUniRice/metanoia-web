<script lang="ts">
	import { onMount } from 'svelte';
	import type { Person, BranchSummary } from '$lib/types.js';
	import { loadBranches } from '$lib/branches.js';
	import PeopleGallery from '$lib/components/PeopleGallery.svelte';
	import BranchCard from '$lib/components/BranchCard.svelte';

	let branches: BranchSummary[] = $state([]);

	const people: Person[] = [
		{
			image: "https://media.licdn.com/dms/image/v2/C4E03AQFdurd5UOsREw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1605063552111?e=2147483647&v=beta&t=E26fvWFbS2O55xiakRheAcW0VUFlA9H54LftR3tNqF8",
			name: "Ray Simar",
			contact: "ray.simar@rice.edu"
		},
		{
			image: "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg",
			name: "...",
			contact: "..."
		},
	];

	onMount(async () => {
		branches = await loadBranches();
	});
</script>

<svelte:head>
	<title>Home - Metanoia</title>
	<meta name="description" content="Welcome to Metanoia's landing page." />
</svelte:head>

<div class="container mx-3 max-w-5xl py-12 px-8">
	<section class="mb-20">
		<h1 class="text-5xl font-bold mb-6 text-light-text-title dark:text-dark-text-title">
			Welcome to Metanoia
		</h1>
		<p class="text-xl text-neutral-primary mb-8 max-w-3xl leading-relaxed">
			Advancing research in machine learning architecture and metabolic sensors.
		</p>
	</section>

	<section class="mb-20">
		<h2 class="text-3xl font-bold mb-10 text-primary-dark dark:text-dark-text-header">
			Our Team
		</h2>
		<div class="max-w-md">
			<PeopleGallery {people} />
		</div>
	</section>

	<section class="mb-20">
		<h2 class="text-3xl font-bold mb-10 text-primary-dark dark:text-dark-text-header">
			Current Projects
		</h2>
		<div class="grid md:grid-cols-2 gap-10">
			{#each branches as branch}
				<BranchCard {branch} />
			{/each}
		</div>
		{#if branches.length === 0}
			<div class="text-gray-500 dark:text-gray-400 mt-8">
				Loading project branches...
			</div>
		{/if}
	</section>
</div>
