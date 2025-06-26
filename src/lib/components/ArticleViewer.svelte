<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	interface Props {
		article: {
			title: string;
			authors: string[];
			htmlPath?: string;
			pdfPath: string;
		};
	}
	let { article }: Props = $props();
	let contentContainer: HTMLDivElement | undefined = $state();
	let loading = $state(true);
	let error = $state(false);
	let useHtml = $state(!!article.htmlPath);
	let htmlContent = $state('');

	// Reactive statement to inject content when both container and content are ready
	$effect(() => {
		console.log('$effect triggered - container:', !!contentContainer, 'htmlContent length:', htmlContent.length, 'useHtml:', useHtml);
		
		if (contentContainer && htmlContent && useHtml) {
			console.log('Injecting content via $effect');
			console.log('Container:', contentContainer);
			console.log('Content length:', htmlContent.length);
			
			try {
				contentContainer.innerHTML = htmlContent;
				console.log('Content injected successfully via $effect');
				
				// Apply dark mode classes if needed
				if (document.documentElement.classList.contains('dark')) {
					contentContainer.classList.add('dark');
				}
			} catch (err) {
				console.error('Error injecting content:', err);
			}
		}
	});

	onMount(() => {
		console.log('ArticleViewer mounted with article:', article);
		console.log('useHtml:', useHtml, 'htmlPath:', article.htmlPath);
		
		if (useHtml && article.htmlPath) {
			// Use setTimeout to ensure the DOM is fully rendered
			setTimeout(() => {
				loadHTMLContent();
			}, 0);
		} else {
			console.log('Using PDF fallback - useHtml:', useHtml, 'htmlPath:', article.htmlPath);
			// Fallback to PDF viewer
			loadPDFContent();
		}
	});

	async function loadHTMLContent() {
		try {
			loading = true;
			error = false;
			
			console.log('Loading HTML content from:', `${base}${article.htmlPath}`);
			
			const response = await fetch(`${base}${article.htmlPath}`);
			console.log('Fetch response status:', response.status, response.ok);
			
			if (!response.ok) {
				throw new Error(`Failed to load HTML: ${response.status}`);
			}
			
			const fetchedHtml = await response.text();
			console.log('HTML content length:', fetchedHtml.length);
			console.log('HTML content preview:', fetchedHtml.substring(0, 200));
			
			// Extract the body content from the converted HTML
			const bodyMatch = fetchedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			const contentToInsert = bodyMatch ? bodyMatch[1] : fetchedHtml;
			
			console.log('Content to insert length:', contentToInsert.length);
			
			// Set the content in state - this will trigger the $effect
			htmlContent = contentToInsert;
			
			loading = false;
		} catch (err) {
			console.error('Error loading HTML content:', err);
			error = true;
			loading = false;
			
			// Fallback to PDF viewer
			useHtml = false;
			loadPDFContent();
		}
	}

	function loadPDFContent() {
		loading = false;
		// This will show the PDF iframe fallback
	}

	function downloadPDF() {
		const link = document.createElement('a');
		link.href = `${base}${article.pdfPath}`;
		link.download = `${article.title}.pdf`;
		link.click();
	}
</script>

<div class="article-viewer w-full h-full">
	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-default"></div>
			<span class="ml-3 text-gray-600 dark:text-gray-400">Loading article...</span>
		</div>
	{:else if useHtml && article.htmlPath}
		<!-- HTML Content Display -->
		<div class="html-content-wrapper">
			<div class="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h2>
					{#if article.authors.length > 0}
						<p class="text-sm text-gray-600 dark:text-gray-400">By {article.authors.join(', ')}</p>
					{/if}
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
			
			<div 
				bind:this={contentContainer}
				class="html-content bg-white dark:bg-gray-900 rounded-lg shadow-sm"
				style="min-height: 600px;"
			></div>
		</div>
	{:else}
		<!-- PDF Fallback -->
		<div class="pdf-fallback">
			<div class="flex items-center justify-between mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">PDF Display Mode</p>
						<p class="text-xs text-yellow-700 dark:text-yellow-300">HTML conversion not available</p>
					</div>
				</div>
				<button
					onclick={downloadPDF}
					class="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Download
				</button>
			</div>
			
			<iframe
				src="{base}{article.pdfPath}"
				class="w-full border border-gray-200 dark:border-gray-700 rounded-lg"
				style="height: 600px;"
				title="PDF Viewer for {article.title}"
			></iframe>
		</div>
	{/if}
</div>

<style>
	:global(.html-content) {
		/* Ensure the HTML content integrates well with the site */
		font-family: system-ui, -apple-system, sans-serif;
	}
	
	:global(.html-content .article-header) {
		/* Override the header from the converted HTML since we have our own */
		display: none;
	}
	
	/* Ensure proper spacing and typography for converted content */
	:global(.html-content .pf) {
		margin-bottom: 1.5rem;
		padding: 2rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	:global(.dark .html-content .pf) {
		background: #1f2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
</style>
