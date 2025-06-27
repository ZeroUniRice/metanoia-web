<script lang="ts">
	import type { Person } from '$lib/types.js';

	interface Props {
		person: Person;
	}

	let { person }: Props = $props();
</script>

<div class="bg-white dark:bg-neutral-dark rounded-4xl md:rounded-lg shadow-md p-3 max-w-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center">
	<img 
		src={person.image} 
		alt={person.name}
		class="w-24 h-24 md:w-36 md:h-36 rounded-full mx-0 mb-3 md:mb-0 object-cover border-gray-800 border-2"
	/>
    <div class="flex-grow md:ml-4">
        <h3 class="text-lg md:text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
            {person.name}
        </h3>
        <p class="text-sm md:text-base text-light-text-secondary dark:text-dark-text-ternary text-center">
            {person.contact}
        </p>
    </div>
</div>
