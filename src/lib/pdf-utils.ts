// DEPRECATED: Planned for removals
import type { PDFContent, PDFSection, PDFFigure, PDFTable, PDFReference } from './types.js';

/**
 * Converts LaTeX content to our PDFContent format
 */
export function parseLaTeXContent(latexContent: string): PDFContent {
	const lines = latexContent.split('\n');
	const content: PDFContent = {
		title: '',
		authors: [],
		sections: []
	};

	let currentSection: PDFSection | null = null;
	let inAbstract = false;
	let abstractContent = '';

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line.startsWith('\\title{')) {
			content.title = extractBraceContent(line);
		}

		if (line.startsWith('\\author{')) {
			const authorContent = extractBraceContent(line);
			content.authors = authorContent.split(',').map(a => a.trim());
		}

		if (line === '\\begin{abstract}') {
			inAbstract = true;
			continue;
		}
		if (line === '\\end{abstract}') {
			inAbstract = false;
			content.abstract = processLatexText(abstractContent);
			abstractContent = '';
			continue;
		}
		if (inAbstract) {
			abstractContent += line + ' ';
			continue;
		}

		if (line.startsWith('\\section{')) {
			if (currentSection) {
				content.sections.push(currentSection);
			}
			currentSection = {
				type: 'section',
				title: extractBraceContent(line),
				content: '',
				level: 1
			};
		} else if (line.startsWith('\\subsection{')) {
			if (currentSection) {
				content.sections.push(currentSection);
			}
			currentSection = {
				type: 'subsection',
				title: extractBraceContent(line),
				content: '',
				level: 2
			};
		} else if (line.startsWith('\\subsubsection{')) {
			if (currentSection) {
				content.sections.push(currentSection);
			}
			currentSection = {
				type: 'subsubsection',
				title: extractBraceContent(line),
				content: '',
				level: 3
			};
		} else if (currentSection && line && !line.startsWith('\\') && !line.startsWith('%')) {
			currentSection.content += line + ' ';
		}
	}

	if (currentSection) {
		content.sections.push(currentSection);
	}

	content.sections = content.sections.map(section => ({
		...section,
		content: processLatexText(section.content)
	}));

	return content;
}

/**
 * Process LaTeX text and convert to HTML
 */
function processLatexText(text: string): string {
	return text
		.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
		.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
		.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
		.replace(/\\\(([^)]+)\\\)/g, '$1$')
		.replace(/\\\[([^\]]+)\\\]/g, '$$1$$')
		.replace(/\\begin\{equation\}(.*?)\\end\{equation\}/gs, '$$1$$')
		.replace(/\\cite\{([^}]+)\}/g, '[$1]')
		.replace(/\\ref\{([^}]+)\}/g, '(ref: $1)')
		.replace(/\n\n/g, '</p><p>')
		.replace(/^(.+)$/s, '<p>$1</p>')
		.replace(/<p>\s*<\/p>/g, '')
		.replace(/\\begin\{itemize\}/g, '<ul>')
		.replace(/\\end\{itemize\}/g, '</ul>')
		.replace(/\\begin\{enumerate\}/g, '<ol>')
		.replace(/\\end\{enumerate\}/g, '</ol>')
		.replace(/\\item\s*/g, '<li>')
		.trim();
}

/**
 * Extract content from LaTeX braces
 */
function extractBraceContent(line: string): string {
	const match = line.match(/\{([^}]+)\}/);
	return match ? match[1] : '';
}
