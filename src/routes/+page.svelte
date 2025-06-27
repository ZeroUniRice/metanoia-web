<script lang="ts">
	import { onMount } from 'svelte';
	import type { Person, Branch } from '$lib/types.js';
	import { loadBranches } from '$lib/branches.js';
	import PeopleGallery from '$lib/components/PeopleGallery.svelte';
	import BranchCard from '$lib/components/BranchCard.svelte';

	let branches: Branch[] = $state([]);

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

<div class="w-full max-w-5xl md:ml-8 py-6 md:py-12 px-4 md:px-8">
	<section class="mb-12 md:mb-20">
		<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-light-text-title dark:text-dark-text-title">
			Welcome to Metanoia
		</h1>
		<p class="text-lg md:text-xl text-neutral-primary mb-6 md:mb-8 max-w-3xl leading-relaxed">
			Advancing research in machine learning architecture and metabolic sensors.
		</p>
	</section>

	<section class="mb-12 md:mb-20">
		<h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-primary-dark dark:text-dark-text-header">
			Our Team
		</h2>
		<div class="max-w-md">
			<PeopleGallery {people} />
		</div>
	</section>

	<section class="mb-12 md:mb-20">
		<h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-primary-dark dark:text-dark-text-header">
			Current Projects
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
			{#each branches as branch}
				<BranchCard {branch} />
			{/each}
		</div>
		{#if branches.length === 0}
			<div class="text-gray-500 dark:text-gray-400 mt-6 md:mt-8 text-sm md:text-base">
				Loading project branches...
			</div>
		{/if}
	</section>
</div>
