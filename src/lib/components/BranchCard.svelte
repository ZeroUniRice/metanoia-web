<script lang="ts">
	import type { BranchSummary } from '$lib/types.js';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';

	interface Props {
		branch: BranchSummary;
	}

	let { branch }: Props = $props();
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-left justify-between">
	<!-- <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
		{branch.name}
	</h3> -->
	<div class="prose dark:prose-invert max-w-none dark:text-honeydew mb-4">
		{@html parseMarkdown(branch.content)}
	</div>	<a 
		href="{base}{branch.route}"
		class="inline-block w-30 hover:bg-primary-dark bg-primary-light dark:hover:bg-primary-default text-white dark:text-gray-400 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
	>
		View Details
	</a>
</div>
