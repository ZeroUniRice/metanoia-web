<!-- IEEE Conference Paper Viewer Component -->
<script lang="ts">
	import type { IEEEPaper } from '$lib/types.js';
	import { onMount } from 'svelte';

	interface Props {
		paper: IEEEPaper;
		showTOC?: boolean;
		mathRenderer?: 'katex' | 'mathjax';
	}

	let { paper, showTOC = true, mathRenderer = 'katex' }: Props = $props();
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

	function generateTOC() {
		return paper.content.sections.filter(section => section.level <= 2);
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

	function formatConferenceInfo(): string {
		let info = '';
		if (paper.conference) info += paper.conference;
		if (paper.year) info += ` (${paper.year})`;
		return info;
	}
</script>

<div class="ieee-paper-viewer max-w-none bg-white dark:bg-gray-900">
	<!-- IEEE Paper Layout -->
	<div class="flex flex-col lg:flex-row gap-8">
		<!-- Table of Contents (Responsive Sidebar) -->
		{#if showTOC && paper.content.sections.length > 0}
			<aside class="lg:w-1/4 lg:sticky lg:top-4 lg:self-start">
				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<h3 class="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Contents</h3>
					<nav class="space-y-2">
						{#each generateTOC() as section}
							{@const sectionId = createSectionId(section.title)}
							<button
								onclick={() => scrollToSection(sectionId)}
								class="block w-full text-left text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors
									{section.level === 1 ? 'font-medium' : 'ml-4 text-gray-600 dark:text-gray-400'}
									{activeSection === sectionId ? 'text-blue-600 dark:text-blue-400' : ''}"
							>
								{section.title}
							</button>
						{/each}
					</nav>
				</div>
			</aside>
		{/if}

		<!-- Main Content (IEEE Two-Column Style on Desktop) -->
		<main class="flex-1 min-w-0">
			<!-- IEEE Paper Header -->
			<header class="text-center mb-8 pb-6 border-b-2 border-gray-300 dark:border-gray-600">
				<h1 class="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
					{paper.title}
				</h1>
				
				<div class="text-lg text-gray-700 dark:text-gray-300 mb-4">
					{formatAuthors(paper.authors)}
				</div>

				{#if paper.conference || paper.year}
					<div class="text-base text-gray-600 dark:text-gray-400 mb-2 italic">
						{formatConferenceInfo()}
					</div>
				{/if}

				{#if paper.doi}
					<div class="text-sm text-gray-500 dark:text-gray-500">
						DOI: <a href="https://doi.org/{paper.doi}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{paper.doi}</a>
					</div>
				{/if}

				{#if paper.keywords.length > 0}
					<div class="mt-4">
						<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Keywords—</span>
						<span class="text-sm text-gray-600 dark:text-gray-400 italic">
							{paper.keywords.join(', ')}
						</span>
					</div>
				{/if}
			</header>

			<!-- Abstract (Full Width) -->
			{#if paper.abstract}
				<section class="mb-8">
					<h2 class="text-lg font-bold mb-3 text-gray-900 dark:text-white">Abstract</h2>
					<div class="text-justify leading-relaxed text-gray-800 dark:text-gray-200 italic border-l-4 border-blue-500 pl-4">
						{paper.abstract}
					</div>
				</section>
			{/if}

			<!-- IEEE Two-Column Layout for Sections -->
			<div class="ieee-columns">
				{#each paper.content.sections as section}
					{@const sectionId = createSectionId(section.title)}
					<section id={sectionId} class="scroll-mt-4 mb-6 break-inside-avoid">
						{#if section.level === 1}
							<h2 class="text-lg font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
								{section.title}
							</h2>
						{:else if section.level === 2}
							<h3 class="text-base font-bold mb-2 text-gray-900 dark:text-white italic">
								{section.title}
							</h3>
						{:else}
							<h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-white">
								{section.title}
							</h4>
						{/if}
						
						<div class="ieee-content text-justify leading-relaxed text-gray-800 dark:text-gray-200 mb-4">
							{@html section.content}
						</div>
					</section>
				{/each}
			</div>

			<!-- Figures (Full Width, Outside Columns) -->
			{#if paper.content.figures && paper.content.figures.length > 0}
				<section class="mt-12 break-inside-avoid">
					<div class="space-y-8">
						{#each paper.content.figures as figure}
							<figure class="text-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
								<img
									src={figure.src}
									alt={figure.alt}
									class="mx-auto rounded shadow-md max-w-full"
									style="width: {figure.width || 'auto'}; height: {figure.height || 'auto'};"
									onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='"
								/>
								<figcaption class="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
									{figure.caption}
								</figcaption>
							</figure>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Tables (Full Width, Outside Columns) -->
			{#if paper.content.tables && paper.content.tables.length > 0}
				<section class="mt-12 break-inside-avoid">
					<div class="space-y-8">
						{#each paper.content.tables as table}
							<div class="overflow-x-auto bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
								<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600 text-sm">
									<thead class="bg-gray-100 dark:bg-gray-700">
										<tr>
											{#each table.headers as header}
												<th class="px-3 py-2 text-left font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600">
													{header}
												</th>
											{/each}
										</tr>
									</thead>
									<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
										{#each table.rows as row}
											<tr>
												{#each row as cell}
													<td class="px-3 py-2 text-gray-900 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
														{cell}
													</td>
												{/each}
											</tr>
										{/each}
									</tbody>
								</table>
								{#if table.caption}
									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
										{table.caption}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- References -->
			{#if paper.content.references && paper.content.references.length > 0}
				<section class="mt-12 break-inside-avoid">
					<h2 class="text-lg font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-wide border-t-2 border-gray-300 dark:border-gray-600 pt-6">
						References
					</h2>
					<div class="space-y-3 text-sm">
						{#each paper.content.references as ref, index}
							<div class="flex">
								<span class="font-bold text-gray-700 dark:text-gray-300 mr-2">[{index + 1}]</span>
								<div class="text-gray-700 dark:text-gray-300">
									<span class="font-medium">{formatAuthors(ref.authors)}</span>
									<span>"{ref.title},"</span>
									{#if ref.journal}
										<em>{ref.journal}</em>,
									{/if}
									<span>{ref.year}.</span>
									{#if ref.url}
										<a href={ref.url} class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1" target="_blank" rel="noopener noreferrer">
											[Online]
										</a>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>

<style>
	:global(.ieee-paper-viewer .katex) {
		font-size: 1em;
	}
	
	:global(.ieee-paper-viewer .katex-display) {
		margin: 1em 0;
		text-align: center;
	}

	.ieee-columns {
		/* Two-column layout on larger screens */
		column-count: 1;
		column-gap: 2rem;
		column-fill: balance;
	}

	@media (min-width: 1024px) {
		.ieee-columns {
			column-count: 2;
		}
	}

	:global(.ieee-content p) {
		margin-bottom: 0.75em;
		text-indent: 1em;
	}

	:global(.ieee-content p:first-child) {
		text-indent: 0;
	}

	:global(.ieee-content ul, .ieee-content ol) {
		margin: 0.5em 0 0.75em 1.5em;
	}

	:global(.ieee-content li) {
		margin-bottom: 0.25em;
	}

	:global(.ieee-content strong) {
		font-weight: 600;
	}

	:global(.ieee-content em) {
		font-style: italic;
	}

	/* Ensure figures and tables break columns properly */
	:global(.ieee-paper-viewer figure),
	:global(.ieee-paper-viewer table) {
		break-inside: avoid;
		page-break-inside: avoid;
	}

	/* Mobile responsiveness */
	@media (max-width: 1023px) {
		.ieee-columns {
			column-count: 1;
		}
		
		:global(.ieee-content p) {
			text-indent: 0;
		}
	}
</style>