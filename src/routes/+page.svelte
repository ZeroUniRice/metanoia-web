<script lang="ts">
	import { onMount } from 'svelte';
	import type { Person, Branch } from '$lib/types.js';
	import { loadBranches } from '$lib/branches.js';
	import PeopleGallery from '$lib/components/PeopleGallery.svelte';
	import BranchCard from '$lib/components/BranchCard.svelte';
	import { base } from '$app/paths';
	import { parseMarkdown } from '$lib/markdown';

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
		<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold font-inter mb-4 md:mb-6 text-light-text-title dark:text-dark-text-title">
			Welcome to Metanoia
		</h1>
		<p class="text-lg md:text-xl text-neutral-primary mb-6 md:mb-8 max-w-3xl leading-relaxed">
			Advancing research in machine learning architecture and metabolic sensors.
		</p>
	</section>

	<section class="mb-12 md:mb-20">
		<h2 class="text-2xl md:text-3xl font-inter font-bold mb-6 md:mb-10 text-primary-dark dark:text-dark-text-header">
			Our Team
		</h2>
		<div class="max-w-md">
			<PeopleGallery {people} />
		</div>
	</section>

	<section class="mb-12 md:mb-20">
		<h2 class="text-2xl md:text-3xl font-inter font-bold mb-6 md:mb-10 text-primary-dark dark:text-dark-text-header">
			Current Projects
		</h2>
		<div class="grid grid-cols-1 gap-6 md:gap-10 -mx-5 md:mx-0">
			{#each branches as branch}
				<BranchCard branch={branch} banner={true}/>
				<div>
					{#each branch.recentArticles as article}
						<a
							href="{base}/branches/{branch.slug}/{article.slug}"
							class="group block relative cursor-pointer size-48 md:size-96 overflow-hidden rounded-lg border border-gray-200 text-left shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 bg-secondary-light dark:bg-gray-800"
						>
							{#if article.thumbnailPath}
								<img
									src="{base}{article.thumbnailPath}"
									alt="Thumbnail for {article.title}"
									class="absolute inset-0 w-full h-full object-fill p-1 rounded-lg blur-xs transition delay-50 duration-300 ease-in-out group-hover:blur-none dark:brightness-20 dark:group-hover:brightness-60"
								/>
							{/if}
							<div class="p-4 md:my-8 z-3 relative overflow-clip">
								<h3 class="mb-2 line-clamp-2 text-md md:text-lg font-semibold text-gray-900 dark:text-white">
									{article.title}
								</h3>
								{#if article.authors.length > 0}
									<p class="mb-2 text-sm text-gray-600 dark:text-gray-400 transition delay-50 duration-300 ease-in-out group-hover:opacity-10">
										By {article.authors.join(', ')}
									</p>
								{/if}
								<p class="line-clamp-4 md:line-clamp-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 transition delay-50 duration-300 ease-in-out group-hover:opacity-10">
									{@html parseMarkdown(article.abstract || 'No abstract available.')}
								</p>
							</div>
						</a>
					{/each}
				</div>
			{/each}
		</div>
		{#if branches.length === 0}
			<div class="text-gray-500 dark:text-gray-400 mt-6 md:mt-8 text-sm md:text-base">
				Loading project branches...
			</div>
		{/if}
	</section>
</div>

<style>
	:global(.clear) {
		filter: brightness(60%);
	}
</style>