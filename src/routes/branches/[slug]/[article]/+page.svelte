<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import { parseMarkdown } from '$lib/markdown';

	let { data }: { data: PageData } = $props();
	let contentContainer: HTMLDivElement | undefined = $state();
	let loading = $state(true);
	let error = $state(false);
	let useHtml = $state(!!data.article.hasHtml);

	let fontStyles = $state('');
	let htmlContent = $state('');

	let currentTheme = $state('dark');
	let isArticleZoomed = $state(false);
	let scrollY = $state(0);
	let articleElement: HTMLDivElement | undefined = $state();
	let dynamicBottomMargin = $state(0);

	const ZOOM_THRESHOLD = 300;
	const ZOOM_SCALE = 1.4;

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
			const shouldZoom = scrollY > ZOOM_THRESHOLD;

			if (shouldZoom && !isArticleZoomed) {
				isArticleZoomed = true;

				if (articleElement) {
					const originalHeight = articleElement.scrollHeight;

					let scaleFactor = ZOOM_SCALE;
					if (window.innerWidth <= 480) {
						scaleFactor = 1.05;
					} else if (window.innerWidth <= 768) {
						scaleFactor = 1.1;
					}

					const extraHeight = originalHeight * (scaleFactor - 1);
					dynamicBottomMargin = extraHeight;
				}
			} else if (!shouldZoom && isArticleZoomed) {
				isArticleZoomed = false;
				dynamicBottomMargin = 0;
			}
		};

		window.addEventListener('scroll', handleScroll);

		if (useHtml && data.article.hasHtml) {
			updateTheme();
			loadHTMLContent();

			const observer = new MutationObserver(() => {
				const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
				if (newTheme !== currentTheme) {
					currentTheme = newTheme;
					loadHTMLContent();
				}
			});

			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class']
			});

			return () => {
				observer.disconnect();
				window.removeEventListener('scroll', handleScroll);
			};
		} else {
			loading = false;

			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});

	function updateTheme() {
		currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	}

	function getDirectoryPath() {
		if (!data.article.hasHtml) return null;
		return data.article.basePath.substring(0, data.article.basePath.lastIndexOf('/'));
	}

	function getBasePDFName() {
		return data.article.basePath.substring(data.article.basePath.lastIndexOf('/') + 1);
	}

	function getThemedHtmlPath() {
		if (!data.article.hasHtml) return null;
		return `${getDirectoryPath()}/${currentTheme}/${getBasePDFName()}.html`;
	}

	async function loadHTMLContent() {
		try {
			loading = true;
			error = false;

			const htmlPath = getThemedHtmlPath();
			if (!htmlPath) throw new Error('No HTML path available');

			const response = await fetch(`${base}${htmlPath}`);
			if (!response.ok) throw new Error(`Failed to load HTML: ${response.status}`);

			const fetchedHtml = await response.text();

			const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
			const pageContainerRegex = /<div id="page-container"[^>]*>([\s\S]*)<\/div>/i;

			const styleMatches = fetchedHtml.match(styleRegex) || [];
			const pageContainerMatch = fetchedHtml.match(pageContainerRegex);

			let layoutStyles = '';
			let parsedFontStyles = '';
			let pageContainerContent = '';

			for (const styleBlock of styleMatches) {
				if (styleBlock.includes('@font-face')) {
					parsedFontStyles += styleBlock;
				} else {
					layoutStyles += styleBlock;
				}
			}

			if (pageContainerMatch) {
				pageContainerContent = pageContainerMatch[1];
			}

			const imageDir = htmlPath.substring(0, htmlPath.lastIndexOf('/'));
			// Replace relative image paths in the page container content
			pageContainerContent = pageContainerContent.replace(
				/src="([^"]+\.png)"/g,
				`src="${base}${imageDir}/$1"`
			);
			// Replace relative font paths (.woff) in the font styles
			parsedFontStyles = parsedFontStyles.replace(
				/url\(([^)]+\.woff)\)/g,
				`url("${base}${imageDir}/$1")`
			);
			// Remove font-size:1px; from the styles due to weird rendering issues
			layoutStyles = layoutStyles.replace(/font-size:\s*1px;/g, '');

			console.log(layoutStyles);

			fontStyles = parsedFontStyles;
			htmlContent = layoutStyles + pageContainerContent;

			loading = false;
		} catch (err) {
			console.error('Error loading HTML content:', err);
			error = true;
			loading = false;
			useHtml = false;
		}
	}

	$effect(() => {
		if (contentContainer && htmlContent && useHtml) {
			try {
				contentContainer.innerHTML = htmlContent;

				const pages = contentContainer.querySelectorAll('.pf');
				pages.forEach((page, index) => {
					page.classList.add('pdf-page');
					if (index > 0 && page instanceof HTMLElement) {
						page.style.marginTop = '2rem';
					}
				});

				const textElements = contentContainer.querySelectorAll('.t');
				textElements.forEach((el) => {
					el.classList.add('pdf-text');
				});
			} catch (err) {
				console.error('Error injecting content:', err);
			}
		}
	});

	function downloadPDF() {
		const link = document.createElement('a');
		link.href = `${base}${data.article.basePath}.pdf`;
		link.download = `${data.article.title}.pdf`;
		link.click();
	}

	function getThemedPdfPath() {
		const isDarkMode =
			document.documentElement.classList.contains('dark') ||
			window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (isDarkMode) {
			return `${data.article.basePath}-dark.pdf`;
		} else {
			return `${data.article.basePath}-light.pdf`;
		}
	}
</script>

<svelte:head>
	<title>{data.article.title} - {data.branch.name} - Metanoia</title>
	<meta name="description" content={data.article.abstract} />

	{#if fontStyles}
		{@html fontStyles}
	{/if}
</svelte:head>

<nav class="border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
	<div class="w-full max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
		<div class="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
			<a
				href="{base}/branches"
				class="text-primary hover:text-primary-dark dark:text-primary-light transition-colors dark:hover:text-white"
			>
				Projects
			</a>
			<span class="text-gray-400 dark:text-gray-600">→</span>
			<a
				href="{base}/branches/{data.branch.slug}"
				class="text-primary hover:text-primary-dark dark:text-primary-light transition-colors dark:hover:text-white truncate max-w-24 md:max-w-none"
			>
				{data.branch.name}
			</a>
			<span class="text-gray-400 dark:text-gray-600">→</span>
			<span class="font-medium text-gray-700 dark:text-gray-300 truncate">
				{data.article.title}
			</span>
		</div>
	</div>
</nav>

<div class="bg-gradient-to-r from-honeydew to-secondary-light dark:from-primary-light dark:to-primary-dark dark:text-white">
	<div class="w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
		<div class="max-w-4xl">
			<h1 class="mb-3 md:mb-4 text-2xl md:text-4xl font-bold leading-tight">
				{data.article.title}
			</h1>
			{#if data.article.authors.length > 0}
				<p class="mb-3 md:mb-4 text-lg md:text-xl opacity-90">
					By {data.article.authors.join(', ')}
				</p>
			{/if}
			{#if data.article.abstract}
				<p class="mb-4 md:mb-6 max-w-3xl text-base md:text-lg leading-relaxed opacity-90">
					{@html parseMarkdown(data.article.abstract)}
				</p>
			{/if}
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div class="text-xs md:text-sm opacity-75">
					Part of <strong>{data.branch.name}</strong> research branch
				</div>
				<button
					onclick={downloadPDF}
					class="flex items-center justify-center md:justify-start gap-2 rounded-lg border border-white/20 bg-white/20 px-4 md:px-6 py-2 md:py-3 backdrop-blur-sm transition-colors hover:bg-white/30 text-sm md:text-base"
				>
					<svg class="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Download PDF
				</button>
			</div>
		</div>
	</div>
</div>

<div class="bg-neutral-light dark:bg-dark-bg">
	<div class="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
		{#if loading}
			<div class="flex items-center justify-center py-16 md:py-24">
				<div class="text-center">
					<div
						class="mx-auto mb-4 size-8 md:size-12 animate-spin rounded-full border-b-2 border-primary"
					></div>
					<span class="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading article...</span>
				</div>
			</div>
		{:else if error}
			<div class="mx-auto max-w-2xl py-8 md:py-12">
				<div
					class="rounded-lg border border-red-200 bg-red-50 p-6 md:p-8 text-center dark:border-red-800 dark:bg-red-900/20"
				>
					<svg
						class="mx-auto mb-4 size-8 md:size-12 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
					<h2 class="mb-3 text-lg md:text-xl font-semibold text-red-800 dark:text-red-200">
						Failed to Load Article
					</h2>
					<p class="mb-4 md:mb-6 text-sm md:text-base text-red-600 dark:text-red-400">
						The article content could not be loaded. Please try downloading the PDF instead.
					</p>
					<button
						onclick={downloadPDF}
						class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base text-white transition-colors hover:bg-red-700"
					>
						<svg class="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Download PDF
					</button>
				</div>
			</div>
		{:else if useHtml && data.article.hasHtml}
			<div
				bind:this={articleElement}
				class="article-container {isArticleZoomed ? 'zoomed' : ''}"
				style="margin-bottom: {dynamicBottomMargin}px;"
			>
				<div class="article-scroll-wrapper">
					<div bind:this={contentContainer} class="article-content-wrapper"></div>
				</div>
			</div>
		{:else}
			<div
				bind:this={articleElement}
				class="article-container {isArticleZoomed ? 'zoomed' : ''}"
				style="margin-bottom: {dynamicBottomMargin}px;"
			>
				<div class="article-scroll-wrapper">
					<div class="mx-auto max-w-4xl">
						<div
							class="mb-6 md:mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 md:p-6 dark:border-amber-800 dark:bg-amber-900/20"
						>
							<div class="flex items-center gap-3">
								<svg
									class="size-5 md:size-6 flex-shrink-0 text-amber-600 dark:text-amber-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p class="font-medium text-sm md:text-base text-amber-800 dark:text-amber-200">PDF Display Mode</p>
									<p class="text-xs md:text-sm text-amber-700 dark:text-amber-300">
										Viewing the original PDF document
									</p>
								</div>
							</div>
						</div>

						<div
							class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
						>
							<iframe
								src="{base}{getThemedPdfPath()}"
								class="w-full border-0 h-96 md:h-[800px]"
								title="PDF Viewer for {data.article.title}"
							></iframe>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.article-container {
		transition:
			transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
			opacity 0.3s ease,
			margin-bottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		transform-origin: center top;
		will-change: transform;
	}

	.article-container.zoomed {
		transform: scale(1.4);
	}

	.article-scroll-wrapper {
		width: 100%;
		overflow-x: auto;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.article-scroll-wrapper::-webkit-scrollbar {
		display: none;
	}

	:global(.article-content-wrapper) {
		max-width: 900px;
		margin: 0 auto;
		background: transparent;
		min-width: 900px;
	}

	:global(.article-content-wrapper .pf) {
		background: white !important;
		border-radius: 12px !important;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
		border: 1px solid #e5e7eb !important;
		margin-bottom: 3rem !important;
		overflow: hidden !important;
		position: relative !important;
		page-break-after: auto !important;
	}

	:global(.dark .article-content-wrapper .pf) {
		background: #1f2937 !important;
		border-color: #374151 !important;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.3),
			0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
	}

	:global(.article-content-wrapper .t) {
		position: absolute !important;
		white-space: pre !important;
		overflow: visible !important;
		z-index: 10 !important;
		user-select: text !important;
		cursor: text !important;
		line-height: 1.3 !important;
	}

	:global(.article-content-wrapper .bi) {
		position: absolute !important;
		z-index: 1 !important;
		border-radius: 8px !important;
	}

	:global(.article-content-wrapper .pc) {
		position: relative !important;
		overflow: hidden !important;
	}

	@media (max-width: 768px) {
		.article-container.zoomed {
			transform: scale(1.1);
		}

		.article-scroll-wrapper {
			overflow-x: auto;
			overflow-y: auto;
			max-height: 70vh;
			scrollbar-width: thin;
			-ms-overflow-style: auto;
		}

		.article-scroll-wrapper::-webkit-scrollbar {
			display: block;
			width: 8px;
			height: 8px;
		}

		.article-scroll-wrapper::-webkit-scrollbar-track {
			background: #f1f1f1;
			border-radius: 4px;
		}

		.article-scroll-wrapper::-webkit-scrollbar-thumb {
			background: #888;
			border-radius: 4px;
		}

		.article-scroll-wrapper::-webkit-scrollbar-thumb:hover {
			background: #555;
		}

		.article-scroll-wrapper::-webkit-scrollbar-corner {
			background: #f1f1f1;
		}

		:global(.article-content-wrapper) {
			min-width: 900px;
			max-width: 900px;
			margin: 0 auto;
			padding: 0 1rem;
		}

		:global(.article-content-wrapper .pf) {
			margin-bottom: 2rem !important;
			border-radius: 8px !important;
			transform: none !important;
			width: auto !important;
			max-width: none !important;
		}

		:global(.article-content-wrapper .pc) {
			transform-origin: top left;
			width: auto !important;
		}
	}

	@media (max-width: 480px) {
		.article-container.zoomed {
			transform: scale(1.05);
		}

		.article-scroll-wrapper {
			max-height: 60vh;
		}

		:global(.article-content-wrapper) {
			min-width: 800px;
			padding: 0 0.5rem;
		}

		:global(.article-content-wrapper .pf) {
			margin-bottom: 1.5rem !important;
		}
	}

	@media (min-width: 769px) {
		:global(.article-content-wrapper) {
			max-width: 900px;
			margin: 0 auto;
			min-width: 900px;
		}

		.article-scroll-wrapper {
			overflow-x: auto;
			overflow-y: visible;
		}
	}

	:global(.article-content-wrapper #sidebar),
	:global(.article-content-wrapper .article-header) {
		display: none !important;
	}

	:global(.article-content-wrapper .t) {
		color: inherit !important;
	}

	:global(.article-content-wrapper a) {
		color: #3b82f6 !important;
		text-decoration: underline !important;
	}

	:global(.dark .article-content-wrapper a) {
		color: #60a5fa !important;
	}

	:global(.article-content-wrapper .t::selection) {
		background: rgba(59, 130, 246, 0.3) !important;
	}

	:global(.dark .article-content-wrapper .t::selection) {
		background: rgba(96, 165, 250, 0.3) !important;
	}
</style>
