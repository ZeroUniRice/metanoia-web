<script lang="ts">
	// DEPRECATED: May keep for future use, but currently article pdfs are converted to HTML for dynamic rendering
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

			const iframe = document.createElement('iframe');
			iframe.src = pdfPath;
			iframe.style.width = '100%';
			iframe.style.height = '800px';
			iframe.style.border = 'none';
			iframe.style.borderRadius = '8px';
			iframe.style.backgroundColor = 'white';
			iframe.style.boxShadow =
				'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';

			iframe.onload = () => {
				loading = false;

				try {
					const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
					if (iframeDoc) {
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
					console.log('PDF viewer styling limited due to cross-origin restrictions');
				}
			};

			iframe.onerror = () => {
				loading = false;
				error = true;
			};

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
				<h1 class="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
			{/if}
			{#if authors.length > 0}
				<p class="mb-4 text-lg text-gray-600">
					by {authors.join(', ')}
				</p>
			{/if}
		</div>
	{/if}

	<div class="pdf-wrapper">
		{#if loading}
			<div class="loading-container">
				<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
				<p class="mt-4 text-gray-600">Loading PDF...</p>
			</div>
		{/if}

		{#if error}
			<div class="error-container">
				<div class="text-center text-red-600">
					<svg class="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<h3 class="mb-2 text-xl font-semibold">Unable to Load PDF</h3>
					<p class="mb-4 text-gray-600">The PDF file could not be displayed.</p>
					<a
						href={pdfPath}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
						Download PDF
					</a>
				</div>
			</div>
		{/if}

		<div bind:this={pdfContainer} class="pdf-container" class:hidden={loading || error}></div>
	</div>

	<div class="mt-6 text-center">
		<a
			href={pdfPath}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800"
		>
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				></path>
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
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
