<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let pdfPath: string;
	export let title: string = '';
	export let authors: string[] = [];

	let pdfContainer: HTMLDivElement;
	let loading = true;
	let error = false;

	onMount(() => {
		if (pdfPath) {
			loadPDF();
		}
	});

	async function loadPDF() {
		try {
			loading = true;
			error = false;

			// Create iframe with custom styling
			const iframe = document.createElement('iframe');
			iframe.src = pdfPath;
			iframe.style.width = '100%';
			iframe.style.height = '800px';
			iframe.style.border = 'none';
			iframe.style.borderRadius = '8px';
			iframe.style.backgroundColor = 'white';
			iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';

			iframe.onload = () => {
				loading = false;
				
				// Try to apply custom styling to PDF viewer
				try {
					const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
					if (iframeDoc) {
						// Create custom CSS for PDF viewer
						const style = iframeDoc.createElement('style');
						style.textContent = `
							body {
								background-color: #f8fafc !important;
								margin: 0 !important;
								padding: 16px !important;
							}
							#viewer {
								background-color: transparent !important;
							}
							.page {
								margin: 16px auto !important;
								box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
								border-radius: 8px !important;
								overflow: hidden !important;
							}
							#toolbarContainer {
								background-color: #1f2937 !important;
								border-bottom: 1px solid #374151 !important;
							}
							.toolbarButton {
								background-color: transparent !important;
								color: #f9fafb !important;
								border: none !important;
							}
							.toolbarButton:hover {
								background-color: #374151 !important;
							}
							#numPages {
								color: #f9fafb !important;
							}
							#pageNumber {
								background-color: #374151 !important;
								color: #f9fafb !important;
								border: 1px solid #4b5563 !important;
							}
						`;
						iframeDoc.head.appendChild(style);
					}
				} catch (e) {
					// Cross-origin restrictions prevent styling - that's okay
					console.log('PDF viewer styling limited due to cross-origin restrictions');
				}
			};

			iframe.onerror = () => {
				loading = false;
				error = true;
			};

			// Clear container and add iframe
			pdfContainer.innerHTML = '';
			pdfContainer.appendChild(iframe);

		} catch (err) {
			console.error('Error loading PDF:', err);
			loading = false;
			error = true;
		}
	}
</script>

<div class="pdf-viewer-container">
	{#if title || authors.length > 0}
		<div class="pdf-header">
			{#if title}
				<h1 class="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
			{/if}
			{#if authors.length > 0}
				<p class="text-lg text-gray-600 mb-4">
					by {authors.join(', ')}
				</p>
			{/if}
		</div>
	{/if}

	<div class="pdf-wrapper">
		{#if loading}
			<div class="loading-container">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				<p class="mt-4 text-gray-600">Loading PDF...</p>
			</div>
		{/if}

		{#if error}
			<div class="error-container">
				<div class="text-red-600 text-center">
					<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<h3 class="text-xl font-semibold mb-2">Unable to Load PDF</h3>
					<p class="text-gray-600 mb-4">The PDF file could not be displayed.</p>
					<a 
						href={pdfPath} 
						target="_blank" 
						rel="noopener noreferrer"
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
						</svg>
						Download PDF
					</a>
				</div>
			</div>
		{/if}

		<div bind:this={pdfContainer} class="pdf-container" class:hidden={loading || error}>
			<!-- PDF iframe will be inserted here -->
		</div>
	</div>

	<!-- Download link -->
	<div class="mt-6 text-center">
		<a 
			href={pdfPath} 
			target="_blank" 
			rel="noopener noreferrer"
			class="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
		>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
			</svg>
			Open in New Tab
		</a>
	</div>
</div>

<style>
	.pdf-viewer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	.pdf-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.pdf-wrapper {
		position: relative;
		background-color: #f8fafc;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
	}

	.pdf-container {
		min-height: 800px;
	}

	.hidden {
		display: none;
	}

	/* Custom scrollbar for better theming */
	.pdf-container :global(iframe) {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	.pdf-container :global(iframe::-webkit-scrollbar) {
		width: 8px;
	}

	.pdf-container :global(iframe::-webkit-scrollbar-track) {
		background: #f1f5f9;
		border-radius: 4px;
	}

	.pdf-container :global(iframe::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 4px;
	}

	.pdf-container :global(iframe::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8;
	}
</style>
