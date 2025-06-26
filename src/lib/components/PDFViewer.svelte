<script lang="ts">
	// Currently obsolete, but kept for reference or future use
	import type { PDFContent, PDFSection, PDFMath, PDFFigure, PDFTable } from '$lib/types.js';
	import { onMount } from 'svelte';

	interface Props {
		content: PDFContent;
		showTOC?: boolean;
		mathRenderer?: 'katex' | 'mathjax';
	}

	let { content, showTOC = true, mathRenderer = 'katex' }: Props = $props();
	let mathLoaded = $state(false);
	let activeSection: string | null = $state(null);

	onMount(async () => {
		if (mathRenderer === 'katex') {
			await loadKaTeX();
		} else {
			await loadMathJax();
		}
		mathLoaded = true;
		renderMath();
	});

	async function loadKaTeX() {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
		document.head.appendChild(link);

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
		document.head.appendChild(script);

		const autoRenderScript = document.createElement('script');
		autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
		document.head.appendChild(autoRenderScript);

		return new Promise(resolve => {
			autoRenderScript.onload = resolve;
		});
	}

	async function loadMathJax() {
		window.MathJax = {
			tex: {
				inlineMath: [['$', '$'], ['\\(', '\\)']],
				displayMath: [['$$', '$$'], ['\\[', '\\]']]
			}
		};

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
		document.head.appendChild(script);

		return new Promise(resolve => {
			script.onload = resolve;
		});
	}

	function renderMath() {
		if (!mathLoaded) return;

		if (mathRenderer === 'katex' && window.renderMathInElement) {
			window.renderMathInElement(document.body, {
				delimiters: [
					{left: '$$', right: '$$', display: true},
					{left: '$', right: '$', display: false},
					{left: '\\(', right: '\\)', display: false},
					{left: '\\[', right: '\\]', display: true}
				]
			});
		} else if (mathRenderer === 'mathjax' && window.MathJax) {
			window.MathJax.typesetPromise();
		}
	}

	function generateTOC(sections: PDFSection[]) {
		return sections.filter(section => section.level <= 2);
	}

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
			activeSection = sectionId;
		}
	}

	function createSectionId(title: string): string {
		return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function formatAuthors(authors: string[]): string {
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
		return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
	}
</script>

<div class="pdf-viewer max-w-none">
	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Table of Contents -->
		{#if showTOC && content.sections.length > 0}
			<aside class="lg:w-1/4 lg:sticky lg:top-4 lg:self-start">
				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<h3 class="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Contents</h3>
					<nav class="space-y-2">
						{#each generateTOC(content.sections) as section}
							{@const sectionId = createSectionId(section.title)}
							<button
								onclick={() => scrollToSection(sectionId)}
								class="block w-full text-left text-sm hover:text-primary-default dark:hover:text-primary-light transition-colors
									{section.level === 1 ? 'font-medium' : 'ml-4 text-gray-600 dark:text-gray-400'}
									{activeSection === sectionId ? 'text-primary-default dark:text-primary-light' : ''}"
							>
								{section.title}
							</button>
						{/each}
					</nav>
				</div>
			</aside>
		{/if}

		<!-- Main Content -->
		<main class="flex-1 min-w-0">
			<!-- Header -->
			<header class="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
				<h1 class="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
					{content.title}
				</h1>
				
				{#if content.authors.length > 0}
					<p class="text-lg text-gray-600 dark:text-gray-400 mb-4">
						{formatAuthors(content.authors)}
					</p>
				{/if}

				{#if content.metadata?.keywords}
					<div class="flex flex-wrap gap-2">
						{#each content.metadata.keywords as keyword}
							<span class="px-2 py-1 bg-primary-light/20 text-primary-dark dark:bg-primary-dark/20 dark:text-primary-light rounded text-sm">
								{keyword}
							</span>
						{/each}
					</div>
				{/if}
			</header>

			<!-- Abstract -->
			{#if content.abstract}
				<section class="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Abstract</h2>
					<div class="prose dark:prose-invert max-w-none">
						{@html content.abstract}
					</div>
				</section>
			{/if}

			<!-- Sections -->
			<div class="space-y-8">
				{#each content.sections as section}
					{@const sectionId = createSectionId(section.title)}
					<section id={sectionId} class="scroll-mt-4">
						{#if section.level === 1}
							<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
								{section.title}
							</h2>
						{:else if section.level === 2}
							<h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
								{section.title}
							</h3>
						{:else}
							<h4 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">
								{section.title}
							</h4>
						{/if}
						
						<div class="prose dark:prose-invert max-w-none mb-6">
							{@html section.content}
						</div>
					</section>
				{/each}
			</div>

			<!-- Figures -->
			{#if content.figures && content.figures.length > 0}
				<section class="mt-12">
					<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
						Figures
					</h2>
					<div class="grid gap-8">
						{#each content.figures as figure}
							<figure class="text-center">
								<img
									src={figure.src}
									alt={figure.alt}
									class="mx-auto rounded-lg shadow-md max-w-full"
									style="width: {figure.width || 'auto'}; height: {figure.height || 'auto'};"
								/>
								<figcaption class="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
									{figure.caption}
								</figcaption>
							</figure>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Tables -->
			{#if content.tables && content.tables.length > 0}
				<section class="mt-12">
					<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
						Tables
					</h2>
					<div class="space-y-8">
						{#each content.tables as table}
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
									<thead class="bg-gray-50 dark:bg-gray-800">
										<tr>
											{#each table.headers as header}
												<th class="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
													{header}
												</th>
											{/each}
										</tr>
									</thead>
									<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
										{#each table.rows as row}
											<tr>
												{#each row as cell}
													<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
														{cell}
													</td>
												{/each}
											</tr>
										{/each}
									</tbody>
								</table>
								{#if table.caption}
									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 italic text-center">
										{table.caption}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- References -->
			{#if content.references && content.references.length > 0}
				<section class="mt-12">
					<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
						References
					</h2>
					<div class="space-y-4">
						{#each content.references as ref}
							<div class="text-sm">
								<span class="font-medium">{formatAuthors(ref.authors)}</span>
								({ref.year}).
								<em>{ref.title}</em>.
								{#if ref.journal}
									<span class="italic">{ref.journal}</span>.
								{/if}
								{#if ref.url}
									<a href={ref.url} class="text-primary-default hover:text-primary-dark dark:text-primary-light dark:hover:text-white ml-2" target="_blank" rel="noopener noreferrer">
										[Link]
									</a>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>

<style>
	:global(.pdf-viewer .katex) {
		font-size: 1.1em;
	}
	
	:global(.pdf-viewer .katex-display) {
		margin: 1.5em 0;
		text-align: center;
	}
	
	:global(.pdf-viewer .prose) {
		line-height: 1.7;
	}
	
	:global(.pdf-viewer .prose p) {
		margin-bottom: 1.25em;
		text-align: justify;
	}
	
	:global(.pdf-viewer .prose h1, .pdf-viewer .prose h2, .pdf-viewer .prose h3, .pdf-viewer .prose h4) {
		margin-top: 2em;
		margin-bottom: 1em;
	}
</style>
