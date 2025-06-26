<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let contentContainer: HTMLDivElement | undefined = $state();
	let loading = $state(true);
	let error = $state(false);
	let useHtml = $state(!!data.article.hasHtml);

	let fontStyles = $state('');
	let htmlContent = $state('');

	let currentTheme = $state('light');

	onMount(() => {
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
			
			return () => observer.disconnect();
		} else {
			loading = false;
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
			// Has the format src:url([fontname.woff])
			parsedFontStyles = parsedFontStyles.replace(
				/url\(([^)]+\.woff)\)/g,
				`url("${base}${imageDir}/$1")`
			);

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
				
				// Apply consistent styling to all page elements
				const pages = contentContainer.querySelectorAll('.pf');
				pages.forEach((page, index) => {
					page.classList.add('pdf-page');
					// Add spacing between pages
					if (index > 0 && page instanceof HTMLElement) {
						page.style.marginTop = '2rem';
					}
				});

				// Ensure proper text rendering
				const textElements = contentContainer.querySelectorAll('.t');
				textElements.forEach(el => {
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
		const isDarkMode = document.documentElement.classList.contains('dark') || 
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
	<meta name="description" content="{data.article.abstract}" />

	{#if fontStyles}
		{@html fontStyles}
	{/if}
</svelte:head>

<!-- Navigation breadcrumb -->
<nav class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<div class="container mx-auto max-w-6xl px-6 py-4">
		<div class="flex items-center space-x-2 text-sm">
			<a 
				href="{base}/branches"
				class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
			>
				Projects
			</a>
			<span class="text-gray-400 dark:text-gray-600">→</span>
			<a 
				href="{base}/branches/{data.branch.slug}"
				class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white transition-colors"
			>
				{data.branch.name}
			</a>
			<span class="text-gray-400 dark:text-gray-600">→</span>
			<span class="text-gray-700 dark:text-gray-300 font-medium">
				{data.article.title}
			</span>
		</div>
	</div>
</nav>

<!-- Article header integrated into the page flow -->
<div class="bg-gradient-to-r from-primary-light to-primary-default text-white">
	<div class="container mx-auto max-w-6xl px-6 py-12">
		<div class="max-w-4xl">
			<h1 class="text-4xl font-bold mb-4">
				{data.article.title}
			</h1>
			{#if data.article.authors.length > 0}
				<p class="text-xl opacity-90 mb-4">
					By {data.article.authors.join(', ')}
				</p>
			{/if}
			{#if data.article.abstract}
				<p class="text-lg opacity-90 leading-relaxed mb-6 max-w-3xl">
					{data.article.abstract}
				</p>
			{/if}
			<div class="flex items-center justify-between">
				<div class="text-sm opacity-75">
					Part of <strong>{data.branch.name}</strong> research branch
				</div>
				<button
					onclick={downloadPDF}
					class="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors border border-white/20"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Download PDF
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Main article content area -->
<div class="bg-neutral-light dark:bg-dark-bg">
	<div class="container mx-auto max-w-6xl px-6 py-8">
		{#if loading}
			<div class="flex items-center justify-center py-24">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-default mx-auto mb-4"></div>
					<span class="text-gray-600 dark:text-gray-400">Loading article...</span>
				</div>
			</div>
		{:else if error}
			<div class="max-w-2xl mx-auto py-12">
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
					<svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
					<h2 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">Failed to Load Article</h2>
					<p class="text-red-600 dark:text-red-400 mb-6">The article content could not be loaded. Please try downloading the PDF instead.</p>
					<button
						onclick={downloadPDF}
						class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Download PDF
					</button>
				</div>
			</div>
		{:else}
			<!-- Article content integrated seamlessly into page -->
			{#if useHtml && data.article.hasHtml}
				<!-- PDF-to-HTML content display -->
				<div 
					bind:this={contentContainer}
					class="article-content-wrapper"
				></div>
			{:else}
				<!-- PDF fallback with better integration -->
				<div class="max-w-4xl mx-auto">
					<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
						<div class="flex items-center gap-3">
							<svg class="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div>
								<p class="font-medium text-amber-800 dark:text-amber-200">PDF Display Mode</p>
								<p class="text-sm text-amber-700 dark:text-amber-300">Viewing the original PDF document</p>
							</div>
						</div>
					</div>
					
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						<iframe
							src="{base}{getThemedPdfPath()}"
							class="w-full border-0"
							style="height: 800px;"
							title="PDF Viewer for {data.article.title}"
						></iframe>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* PDF-to-HTML content integration styles */
	:global(.article-content-wrapper) {
		/* Make the content feel native to the page */
		max-width: 900px;
		margin: 0 auto;
		background: transparent;
	}

	/* pdf2htmlEX page styling for seamless integration */
	:global(.article-content-wrapper .pf) {
		background: white !important;
		border-radius: 12px !important;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
		border: 1px solid #e5e7eb !important;
		margin-bottom: 3rem !important;
		/* padding: 3rem !important; */
		overflow: hidden !important;
		position: relative !important;
		page-break-after: auto !important;
	}

	:global(.dark .article-content-wrapper .pf) {
		background: #1f2937 !important;
		border-color: #374151 !important;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
	}

	/* Text elements - ensure proper rendering over backgrounds */
	:global(.article-content-wrapper .t) {
		position: absolute !important;
		white-space: pre !important;
		overflow: visible !important;
		z-index: 10 !important;
		user-select: text !important;
		cursor: text !important;
		line-height: 1.3 !important;
	}

	/* Background images - ensure they stay behind text */
	:global(.article-content-wrapper .bi) {
		position: absolute !important;
		z-index: 1 !important;
		border-radius: 8px !important;
	}

	/* Page containers - ensure proper positioning */
	:global(.article-content-wrapper .pc) {
		position: relative !important;
		overflow: hidden !important;
	}

	/* Responsive scaling for mobile devices */
	@media (max-width: 768px) {
		:global(.article-content-wrapper) {
			max-width: 100%;
			padding: 0 1rem;
		}
		
		:global(.article-content-wrapper .pf) {
			padding: 1.5rem !important;
			margin-bottom: 2rem !important;
			border-radius: 8px !important;
		}
		
		/* Scale down content on mobile if needed */
		:global(.article-content-wrapper .pc) {
			transform-origin: top left;
		}
	}

	@media (max-width: 480px) {
		:global(.article-content-wrapper .pf) {
			padding: 1rem !important;
			margin-bottom: 1.5rem !important;
		}
	}

	/* Hide any unwanted elements from the conversion */
	:global(.article-content-wrapper #sidebar),
	:global(.article-content-wrapper .article-header) {
		display: none !important;
	}

	/* Ensure proper text color inheritance */
	:global(.article-content-wrapper .t) {
		color: inherit !important;
	}

	/* Style links within the document */
	:global(.article-content-wrapper a) {
		color: #3b82f6 !important;
		text-decoration: underline !important;
	}

	:global(.dark .article-content-wrapper a) {
		color: #60a5fa !important;
	}

	/* Improve text selection appearance */
	:global(.article-content-wrapper .t::selection) {
		background: rgba(59, 130, 246, 0.3) !important;
	}

	:global(.dark .article-content-wrapper .t::selection) {
		background: rgba(96, 165, 250, 0.3) !important;
	}
</style>
