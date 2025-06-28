<script lang="ts">
	import type { Branch } from '$lib/types.js';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';

	interface Props {
		branch: Branch;
		banner?: boolean;
	}

	let { branch, banner }: Props = $props();

	function getBranchGradient(name: string): string {
		const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
		const hue1 = (hash * 137) % 360;
		const hue2 = (hue1 + 60) % 360;
		return `linear-gradient(135deg, hsl(${hue1}, 60%, 50%), hsl(${hue2}, 60%, 70%))`;
	}
</script>

{#if banner}
	<div
		class="relative h-fit overflow-clip md:rounded-sm border border-gray-200 shadow-md dark:border-gray-700 md:mask-[linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]"
	>
		{#if branch.bannerImage}
			<img
				src="{base}{branch.bannerImage}"
				alt="{branch.name} Banner"
				class="absolute inset-0 h-full w-full object-cover dark:brightness-70 opacity-90"
			/>
		{:else}
			<div
				class="absolute inset-0 flex items-center justify-center"
				style="background: {getBranchGradient(branch.name)}"
			></div>
		{/if}
		<div class="flex flex-col gap-1 md:gap-2 h-full items-left justify-left pt-3 md:pt-4">
			<h1 class="text-2xl md:text-4xl font-bold text-light-text dark:text-dark-text z-1 ml-3 md:ml-6">{branch.name}</h1>
			<div class="text-lg text-light-text ml-7 md:ml-10">
				<strong class="bg-white opacity-60 w-fit rounded-lg">
					{branch.articleCount} {branch.articleCount === 1 ? 'article' : 'articles'}
				</strong>
			</div>
			<div class="z-1 pl-3 md:pl-7 md:pr-6 pb-1 pt-1 max-h-20 line-clamp-2 text-light-text-secondary bg-honeydew opacity-80 md:rounded-sm w-fit text-sm md:text-base border-t border-gray-800">
				{branch.content}
			</div>
		</div>
	</div>
{:else}
	<div
		class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
	>
		<div
			class="relative flex h-32 items-center justify-center text-xl font-bold"
			style="background: {getBranchGradient(branch.name)}"
		>
			<div class="absolute inset-0"></div>
			<h3 class="text-light-text relative z-10 px-4 text-center">{branch.name}</h3>
		</div>

		<div class="flex flex-1 flex-col p-6">
			<div class="prose dark:prose-invert dark:text-honeydew mb-4 max-w-none flex-1">
				{@html parseMarkdown(branch.content)}
			</div>

			<div class="mt-4 flex items-center justify-between">
				<div class="text-sm text-gray-600 dark:text-gray-400">
					{branch.articleCount}
					{branch.articleCount === 1 ? 'article' : 'articles'}
				</div>
				<a
					href="{base}{branch.route}"
					class="hover:bg-primary-dark bg-primary-light dark:hover:bg-primary-default inline-block rounded-lg px-4 py-2 font-medium text-white transition duration-300 ease-in-out dark:text-gray-400"
				>
					View Details
				</a>
			</div>
		</div>
	</div>
{/if}
