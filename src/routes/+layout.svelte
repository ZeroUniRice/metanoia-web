<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let { children } = $props();
	let isDarkMode = $state(
		typeof window !== 'undefined' ? 
			(localStorage.theme === 'dark' || 
				(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))
			: false
	);

	onMount(() => {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			isDarkMode = true;
		} else {
			document.documentElement.classList.remove('dark');
			isDarkMode = false;
		}
	});

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.theme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.theme = 'light';
		}
	};
</script>

<div class="min-h-screen bg-neutral-light dark:bg-dark-bg text-gray-900 dark:text-dark-text flex min-h-full flex-col">
	<header class="bg-slate-800 dark:bg-primary-dark shadow-md">
		<nav class="container mx-12 px-3 py-3 flex justify-between items-center flex-grow min-w-21/22">
			<div>
				<a href="{base}/" class="text-xl font-semibold text-white hover:text-secondary-dark">
					Metanoia
				</a>
			</div>
			<div class="flex items-center space-x-4">
				<a
					href="{base}/"
					class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-default dark:hover:bg-primary-dark"
				>
					Home
				</a>
				<a
					href="{base}/branches"
					class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-default dark:hover:bg-primary-dark"
				>
					Projects
				</a>
				<a
					href="{base}/pdf-demo"
					class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-default dark:hover:bg-primary-dark"
				>
					Papers
				</a>
				<button
					onclick={toggleDarkMode}
					class="p-2 rounded-md text-white hover:bg-primary-default dark:hover:bg-primary-dark focus:outline-none"
					aria-label="Toggle dark mode"
				>
					{#if isDarkMode}
						<!-- Sun icon for dark mode -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{:else}
						<!-- Moon icon for light mode -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</nav>
	</header>

	<main class="container p-3 flex-grow bg-neutral-light dark:bg-dark-bg min-w-full">
		{@render children()}
	</main>

	<footer
		class="bg-neutral dark:bg-gray-800 text-center p-4 text-gray-600 dark:text-gray-400 sticky bottom-0"
	>
		<p>
			Built statically with svelte js!
		</p>
	</footer>
</div>

<!--
/**
 * @file +layout.svelte
 * @description
 *   This is the main layout component for the SvelteKit application.
 *   It sets up the overall page structure, including a header with navigation
 *   and a dark mode toggle, a main content area, and a footer.
 *   It also handles the logic for persisting and applying the dark mode theme.
 *
 *   The dark mode functionality:
 *   - Checks `localStorage` for a saved theme preference on component mount.
 *   - If no preference is found, it respects the user's system preference
 *     (via `prefers-color-scheme`).
 *   - Applies the 'dark' class to the `<html>` element to enable Tailwind's
 *     `dark:` variants.
 *   - Provides a `toggleDarkMode` function to switch themes and save the
 *     preference to `localStorage`.
 *
 *   Styling:
 *   - Uses Tailwind CSS utility classes for styling.
 *   - Defines a color palette in `tailwind.config.js` which is referenced here
 *     (e.g., `bg-primary-light`, `dark:bg-dark-bg`).
 *   - The layout is responsive (`container mx-auto`).
 */
-->
