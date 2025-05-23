<script lang="ts">
	import type { Person } from '$lib/types.js';
	import PersonCard from './PersonCard.svelte';

	interface Props {
		people: Person[];
	}

	let { people }: Props = $props();
	let currentIndex = $state(0);
	let containerRef: HTMLDivElement;

	function nextSlide() {
		currentIndex = (currentIndex + 1) % people.length;
	}

	function prevSlide() {
		currentIndex = currentIndex === 0 ? people.length - 1 : currentIndex - 1;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}
</script>

<div class="relative overflow-hidden" bind:this={containerRef}>
	<div 
		class="flex transition-transform duration-300 ease-in-out px-8"
		style="transform: translateX(-{currentIndex * 100}%)"
	>
		{#each people as person, index}
			<div class="w-full flex-shrink-0">
				<PersonCard {person} />
			</div>
			{#if index < people.length - 1}
				<div class="min-w-16"> </div>
			{/if}
		{/each}
	</div>

	{#if people.length > 1}		<button
			onclick={prevSlide}
			class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 transition duration-200"
			aria-label="Previous person"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
			</svg>
		</button>
		<button
			onclick={nextSlide}
			class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 transition duration-200"
			aria-label="Next person"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
			</svg>
		</button>

		<div class="flex justify-center mt-4 space-x-2">
			{#each people as _, index}				<button
					onclick={() => goToSlide(index)}
					class="w-3 h-3 rounded-full transition duration-200 {index === currentIndex ? 'bg-primary-default dark:bg-primary-light' : 'bg-gray-300 dark:bg-gray-600'}"
					aria-label="Go to person {index + 1}"
				></button>
			{/each}
		</div>
	{/if}
</div>
