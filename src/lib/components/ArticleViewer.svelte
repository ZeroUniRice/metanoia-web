<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	interface Props {
		article: {
			title: string;
			authors: string[];
			htmlPath?: string;
			pdfPath: string;
			abstract?: string;
		};
		showHeader?: boolean;
	}
	let { article, showHeader = true }: Props = $props();
	let contentContainer: HTMLDivElement | undefined = $state();
	let loading = $state(true);
	let error = $state(false);
	let useHtml = $state(!!article.htmlPath);
	let htmlContent = $state('');

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
				textElements.forEach(el => {
					el.classList.add('pdf-text');
				});
			} catch (err) {
				console.error('Error injecting content:', err);
			}
		}
	});

	onMount(() => {
		if (useHtml && article.htmlPath) {
			setTimeout(() => {
				loadHTMLContent();
			}, 0);
		} else {
			loadPDFContent();
		}
	});

	async function loadHTMLContent() {
		try {
			loading = true;
			error = false;
			
			const response = await fetch(`${base}${article.htmlPath}`);
			if (!response.ok) {
				throw new Error(`Failed to load HTML: ${response.status}`);
			}
			
			const fetchedHtml = await response.text();
			
			let contentToInsert = '';
			const pageContainerMatch = fetchedHtml.match(/<div id="page-container"[^>]*>([\s\S]*?)<\/div>\s*<\/body>/i);
			
			if (pageContainerMatch) {
				contentToInsert = pageContainerMatch[1];
			} else {
				const bodyMatch = fetchedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
				if (bodyMatch) {
					let bodyContent = bodyMatch[1];
					bodyContent = bodyContent.replace(/<div class="article-header[^>]*>[\s\S]*?<\/div>/i, '');
					bodyContent = bodyContent.replace(/<div id="sidebar"[^>]*>[\s\S]*?<\/div>/i, '');
					contentToInsert = bodyContent;
				} else {
					contentToInsert = fetchedHtml;
				}
			}
			
			htmlContent = contentToInsert;
			loading = false;
		} catch (err) {
			console.error('Error loading HTML content:', err);
			error = true;
			loading = false;
			useHtml = false;
			loadPDFContent();
		}
	}

	function loadPDFContent() {
		loading = false;
	}

	function downloadPDF() {
		const link = document.createElement('a');
		link.href = `${base}${article.pdfPath}`;
		link.download = `${article.title}.pdf`;
		link.click();
	}
</script>

<div class="article-viewer w-full">
	{#if loading}
		<div class="flex items-center justify-center py-16">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-default mx-auto mb-3"></div>
				<span class="text-sm text-gray-600 dark:text-gray-400">Loading article...</span>
			</div>
		</div>
	{:else if error}
		<div class="py-8">
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
				<svg class="w-8 h-8 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
				<h3 class="font-medium text-red-800 dark:text-red-200 mb-2">Failed to Load Article</h3>
				<p class="text-sm text-red-600 dark:text-red-400 mb-4">Unable to display the article content.</p>
				<button
					onclick={downloadPDF}
					class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Download PDF
				</button>
			</div>
		</div>
	{:else}
		{#if showHeader}
			<!-- Article header -->
			<div class="mb-6 p-6 bg-gradient-to-r from-primary-light to-primary-default text-white rounded-lg">
				<h2 class="text-2xl font-bold mb-2">{article.title}</h2>
				{#if article.authors.length > 0}
					<p class="text-lg opacity-90 mb-2">By {article.authors.join(', ')}</p>
				{/if}
				{#if article.abstract}
					<p class="opacity-90 text-sm leading-relaxed mb-4">{article.abstract}</p>
				{/if}
				<button
					onclick={downloadPDF}
					class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors border border-white/20 text-sm"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Download PDF
				</button>
			</div>
		{/if}

		{#if useHtml && article.htmlPath}
			<div 
				bind:this={contentContainer}
				class="html-content-container"
			></div>
		{:else}
			<!-- PDF fallback -->
			<div class="pdf-fallback">
				<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<p class="text-sm font-medium text-amber-800 dark:text-amber-200">PDF Display Mode</p>
							<p class="text-xs text-amber-700 dark:text-amber-300">HTML conversion not available</p>
						</div>
					</div>
				</div>
				
				<iframe
					src="{base}{article.pdfPath}"
					class="w-full border border-gray-200 dark:border-gray-700 rounded-lg"
					style="height: 500px;"
					title="PDF Viewer for {article.title}"
				></iframe>
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(.html-content-container) {
		background: transparent;
		max-width: 800px;
		margin: 0 auto;
	}

	:global(.html-content-container .pf) {
		background: white !important;
		border-radius: 8px !important;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
		border: 1px solid #e5e7eb !important;
		margin-bottom: 2rem !important;
		padding: 2rem !important;
		overflow: hidden !important;
		position: relative !important;
	}

	:global(.dark .html-content-container .pf) {
		background: #1f2937 !important;
		border-color: #374151 !important;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
	}

	:global(.html-content-container .t) {
		position: absolute !important;
		white-space: pre !important;
		overflow: visible !important;
		z-index: 10 !important;
		user-select: text !important;
		cursor: text !important;
		line-height: 1.2 !important;
	}

	:global(.html-content-container .bi) {
		position: absolute !important;
		z-index: 1 !important;
		border-radius: 4px !important;
	}

	:global(.html-content-container .pc) {
		position: relative !important;
		overflow: hidden !important;
	}

	:global(.html-content-container #sidebar),
	:global(.html-content-container .article-header) {
		display: none !important;
	}

	@media (max-width: 768px) {
		:global(.html-content-container) {
			max-width: 100%;
		}
		
		:global(.html-content-container .pf) {
			padding: 1rem !important;
			margin-bottom: 1rem !important;
			border-radius: 6px !important;
		}
	}

	:global(.html-content-container .t::selection) {
		background: rgba(59, 130, 246, 0.3) !important;
	}

	:global(.dark .html-content-container .t::selection) {
		background: rgba(96, 165, 250, 0.3) !important;
	}
</style>
