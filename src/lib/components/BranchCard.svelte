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
	<a
		href="{base}{branch.route}"
		class="group block rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 overflow-hidden"
	>
		<div class="relative h-48 w-full overflow-hidden">
			{#if branch.standardImage}
				<img
					src="{base}{branch.standardImage}"
					alt="Thumbnail for {branch.name}"
					class="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
				/>
			{:else}
				<div
					class="h-full w-full flex items-center justify-center"
					style="background: {getBranchGradient(branch.name)}"
				>
					<h3 class="text-2xl font-bold text-white text-center px-4 drop-shadow-md">
						{branch.name}
					</h3>
				</div>
			{/if}
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
			></div>
		</div>
		<div class="p-6">
			<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
				{branch.name}
			</h3>
			<div class="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
				{@html parseMarkdown(branch.content)}
			</div>
			<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
				<span class="font-medium text-primary-default dark:text-primary-light">
					{branch.articleCount} {branch.articleCount === 1 ? 'Article' : 'Articles'}
				</span>
				<span
					class="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				>
					View Project
					<svg
						class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
						></path>
					</svg>
				</span>
			</div>
		</div>
	</a>
{/if}
