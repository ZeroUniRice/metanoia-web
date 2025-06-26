<script lang="ts">
	import type { Branch } from '$lib/types.js';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';

	interface Props {
		branch: Branch;
	}

	let { branch }: Props = $props();
	
	// Generate a gradient background based on branch name
	function getBranchGradient(name: string): string {
		const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
		const hue1 = (hash * 137) % 360;
		const hue2 = (hue1 + 60) % 360;
		return `linear-gradient(135deg, hsl(${hue1}, 60%, 50%), hsl(${hue2}, 60%, 70%))`;
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
	<!-- CSS-based banner -->
	<div 
		class="h-32 relative flex items-center justify-center text-white font-bold text-xl"
		style="background: {getBranchGradient(branch.name)}"
	>
		<div class="absolute inset-0 bg-black bg-opacity-20"></div>
		<h3 class="relative z-10 text-center px-4">{branch.name}</h3>
	</div>
	
	<div class="p-6 flex-1 flex flex-col">
		<div class="prose dark:prose-invert max-w-none dark:text-honeydew mb-4 flex-1">
			{@html parseMarkdown(branch.content)}
		</div>
		
		<div class="flex items-center justify-between mt-4">
			<div class="text-sm text-gray-600 dark:text-gray-400">
				{branch.articleCount} {branch.articleCount === 1 ? 'article' : 'articles'}
			</div>
			<a 
				href="{base}{branch.route}"
				class="inline-block hover:bg-primary-dark bg-primary-light dark:hover:bg-primary-default text-white dark:text-gray-400 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
			>
				View Details
			</a>
		</div>
	</div>
</div>
