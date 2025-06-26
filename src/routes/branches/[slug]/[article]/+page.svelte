<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let contentContainer: HTMLDivElement | undefined = $state();
	let loading = $state(true);
	let error = $state(false);
	let useHtml = $state(!!data.article.hasHtml);
	let htmlContent = $state('');
	let currentTheme = $state('light');

	onMount(() => {
		if (useHtml && data.article.hasHtml) {
			// Detect initial theme
			updateTheme();
			loadHTMLContent();
			
			// Watch for theme changes
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

	function getThemedHtmlPath() {
		if (!data.article.hasHtml) return null;
		return `${data.article.basePath}-${currentTheme}.html`;
	}

	async function loadHTMLContent() {
		try {
			loading = true;
			error = false;
			
			const htmlPath = getThemedHtmlPath();
			if (!htmlPath) {
				throw new Error('No HTML path available');
			}
			
			const response = await fetch(`${base}${htmlPath}`);
			if (!response.ok) {
				throw new Error(`Failed to load HTML: ${response.status}`);
			}
			
			const fetchedHtml = await response.text();
			
			// Extract the body content from the converted HTML
			const bodyMatch = fetchedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			const contentToInsert = bodyMatch ? bodyMatch[1] : fetchedHtml;
			
			htmlContent = contentToInsert;
			loading = false;
		} catch (err) {
			console.error('Error loading HTML content:', err);
			error = true;
			loading = false;
			useHtml = false;
		}
	}

	// Inject HTML content when ready
	$effect(() => {
		if (contentContainer && htmlContent && useHtml) {
			try {
				contentContainer.innerHTML = htmlContent;
				
				// Apply theme-specific classes to the container
				if (document.documentElement.classList.contains('dark')) {
					contentContainer.classList.add('dark');
				} else {
					contentContainer.classList.remove('dark');
				}
				
				// Ensure pdf2htmlEX content is properly styled
				const pageContainer = contentContainer.querySelector('#page-container');
				if (pageContainer) {
					pageContainer.classList.add('pdf2htmlex-container');
				}
				
				// Apply consistent styling to all page elements
				const pages = contentContainer.querySelectorAll('.pf');
				pages.forEach(page => {
					page.classList.add('pdf-page');
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
		// Check if user prefers dark mode
		const isDarkMode = document.documentElement.classList.contains('dark') || 
			window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		// Return themed PDF path using base path
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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="container mx-auto max-w-4xl px-6 py-8">
		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-default"></div>
				<span class="ml-3 text-gray-600 dark:text-gray-400">Loading article...</span>
			</div>
		{:else if error}
			<div class="text-center py-12">
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
					<h2 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Failed to Load Article</h2>
					<p class="text-red-600 dark:text-red-400 mb-4">The article content could not be loaded. Please try downloading the PDF instead.</p>
					<button
						onclick={downloadPDF}
						class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Download PDF
					</button>
				</div>
			</div>
		{:else}
			<!-- Article header -->
			<header class="mb-8">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						{data.article.title}
					</h1>
					{#if data.article.authors.length > 0}
						<p class="text-lg text-gray-600 dark:text-gray-400 mb-4">
							By {data.article.authors.join(', ')}
						</p>
					{/if}
					{#if data.article.abstract}
						<p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
							{data.article.abstract}
						</p>
					{/if}
					<div class="flex items-center justify-between">
						<div class="text-sm text-gray-500 dark:text-gray-400">
							Part of <strong>{data.branch.name}</strong> research branch
						</div>
						<button
							onclick={downloadPDF}
							class="flex items-center gap-2 px-4 py-2 bg-primary-default hover:bg-primary-dark text-white rounded-lg transition-colors"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Download PDF
						</button>
					</div>
				</div>
			</header>

			<!-- Article content -->
			<main>
				{#if useHtml && data.article.hasHtml}
					<!-- HTML Content Display -->
					<div 
						bind:this={contentContainer}
						class="article-content bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
					></div>
				{:else}
					<!-- PDF Fallback -->
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
						<div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
							<div class="flex items-center gap-3">
								<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">PDF Display Mode</p>
									<p class="text-xs text-yellow-700 dark:text-yellow-300">HTML conversion not available for this article</p>
								</div>
							</div>
						</div>
						
						<iframe
							src="{base}{getThemedPdfPath()}"
							class="w-full border-0 rounded-b-lg"
							style="height: 800px;"
							title="PDF Viewer for {data.article.title}"
						></iframe>
					</div>
				{/if}
			</main>
		{/if}
	</div>
</div>

<style>
    /* pdf2htmlEX specific styling */
	:global(.pdf2htmlex-container) {
		margin: 0 auto;
		max-width: none !important;
		padding: 0 !important;
	}
	
	:global(.pdf-page) {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border-radius: 0.5rem;
		background-color: white;
		margin-bottom: 1.5rem;
		border: 1px solid #e5e7eb;
		overflow: hidden;
		position: relative;
	}
	
	:global(.dark .pdf-page) {
		background-color: #1f2937;
		border-color: #374151;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
	}
	
	/* Ensure proper text rendering over background images */
	:global(.pdf-page .t) {
		position: absolute;
		white-space: pre;
		overflow: visible;
		z-index: 2;
	}
	
	/* Background image pages from pdf2htmlEX */
	:global(.pdf-page .b) {
		position: absolute;
		z-index: 1;
	}
	
	/* Text selection and interaction */
	:global(.pdf-page .t) {
		user-select: text;
		cursor: text;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		:global(.pdf2htmlex-container) {
			transform-origin: top left;
		}
	}

	:global(.article-content) {
		/* Base styling for the injected HTML content */
		padding: 0;
		overflow: hidden;
	}
	
	/* Override PDF conversion container styles for full-page integration */
	:global(.article-content #page-container) {
		position: static !important;
		margin: 0 !important;
		padding: 2rem !important;
		max-width: none !important;
		background: transparent !important;
	}
	
	/* Style the PDF pages for better integration */
	:global(.article-content .pf) {
		margin: 0 0 2rem 0 !important;
		padding: 2rem !important;
		background: white !important;
		border: 1px solid #e5e7eb !important;
		border-radius: 0.5rem !important;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
		page-break-after: auto !important;
	}
	
	:global(.dark .article-content .pf) {
		background: #1f2937 !important;
		border-color: #374151 !important;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3) !important;
	}
	
	/* Ensure text is readable in both light and dark modes */
	:global(.article-content .t) {
		color: #111827 !important;
	}
	
	:global(.dark .article-content .t) {
		color: #f9fafb !important;
	}
	
	/* Hide any background patterns from the PDF conversion */
	:global(.article-content) {
		background-image: none !important;
	}
	
	/* Improve readability of small text */
	:global(.article-content .t) {
		line-height: 1.4 !important;
	}
	
	/* Responsive scaling for mobile */
	@media (max-width: 768px) {
		:global(.article-content #page-container) {
			padding: 1rem !important;
		}
		
		:global(.article-content .pf) {
			padding: 1rem !important;
			margin: 0 0 1rem 0 !important;
		}
	}
</style>
