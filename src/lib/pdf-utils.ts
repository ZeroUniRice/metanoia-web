// Utility functions for processing PDF/LaTeX content
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

		// Extract title
		if (line.startsWith('\\title{')) {
			content.title = extractBraceContent(line);
		}

		// Extract authors
		if (line.startsWith('\\author{')) {
			const authorContent = extractBraceContent(line);
			content.authors = authorContent.split(',').map(a => a.trim());
		}

		// Handle abstract
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

		// Handle sections
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

	// Add the last section
	if (currentSection) {
		content.sections.push(currentSection);
	}

	// Process content in sections
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
		// Handle bold text
		.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
		// Handle italic text
		.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
		.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
		// Handle inline math (keep as LaTeX for KaTeX/MathJax)
		.replace(/\\\(([^)]+)\\\)/g, '$1$')
		// Handle display math
		.replace(/\\\[([^\]]+)\\\]/g, '$$1$$')
		// Handle equation environment
		.replace(/\\begin\{equation\}(.*?)\\end\{equation\}/gs, '$$1$$')
		// Handle citations (convert to simple format)
		.replace(/\\cite\{([^}]+)\}/g, '[$1]')
		// Handle references
		.replace(/\\ref\{([^}]+)\}/g, '(ref: $1)')
		// Convert paragraphs
		.replace(/\n\n/g, '</p><p>')
		// Wrap in paragraph tags
		.replace(/^(.+)$/s, '<p>$1</p>')
		// Clean up empty paragraphs
		.replace(/<p>\s*<\/p>/g, '')
		// Handle itemize/enumerate
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

/**
 * Create sample PDF content for testing
 */
export function createSamplePDFContent(): PDFContent {
	return {
		title: "Machine Learning Architecture for Metabolic Sensor Networks",
		authors: ["Dr. Jane Smith", "Prof. John Doe", "Sarah Johnson"],
		abstract: "<p>This paper presents a novel approach to machine learning architecture designed specifically for metabolic sensor networks. We explore the integration of continuous glucose monitors with predictive algorithms to provide real-time metabolic insights.</p>",
		sections: [
			{
				type: 'section',
				title: 'Introduction',
				content: '<p>The advent of personal metabolic sensors, particularly <strong>Continuous Glucose Monitors (CGMs)</strong>, has opened new avenues for understanding individual metabolic responses. Traditional approaches to metabolic monitoring have been limited by infrequent measurements and lack of real-time feedback.</p><p>In this work, we propose a comprehensive machine learning framework that can process continuous metabolic data streams and provide actionable insights for both individuals and healthcare providers.</p>',
				level: 1
			},
			{
				type: 'section',
				title: 'Methodology',
				content: '<p>Our approach consists of three main components:</p><ul><li>Data preprocessing and normalization</li><li>Feature extraction from temporal patterns</li><li>Predictive modeling using ensemble methods</li></ul><p>The mathematical foundation relies on the following optimization problem: $$\\min_{\\theta} \\sum_{i=1}^{n} L(y_i, f(x_i; \\theta)) + \\lambda R(\\theta)$$ where $L$ represents the loss function, $f$ is our model, and $R(\\theta)$ is the regularization term.</p>',
				level: 1
			},
			{
				type: 'subsection',
				title: 'Data Preprocessing',
				content: '<p>Raw CGM data requires significant preprocessing to handle noise, missing values, and sensor drift. We employ a multi-step approach:</p><p>First, we apply a <em>Kalman filter</em> to smooth the glucose readings: $$x_{k+1} = Ax_k + Bu_k + w_k$$ where $w_k$ represents the process noise.</p>',
				level: 2
			},
			{
				type: 'section',
				title: 'Results',
				content: '<p>Our experiments demonstrate significant improvements over baseline methods. The proposed architecture achieves a <strong>Mean Absolute Error (MAE)</strong> of 8.2 mg/dL for 30-minute glucose predictions, compared to 12.4 mg/dL for traditional linear models.</p><p>Key findings include:</p><ul><li>Ensemble methods outperform single models by 15%</li><li>Temporal features capture important circadian patterns</li><li>Individual calibration improves accuracy by 22%</li></ul>',
				level: 1
			},
			{
				type: 'section',
				title: 'Conclusion',
				content: '<p>This work demonstrates the potential of machine learning architectures in metabolic sensor networks. Future work will focus on expanding to multi-sensor systems and investigating personalization strategies.</p>',
				level: 1
			}
		],
		figures: [
			{
				type: 'figure',
				src: '/static/images/cgm-architecture.png',
				alt: 'System architecture diagram',
				caption: 'Figure 1: Overview of the proposed machine learning architecture for CGM data processing',
				width: '80%'
			},
			{
				type: 'figure',
				src: '/static/images/prediction-results.png',
				alt: 'Prediction accuracy comparison',
				caption: 'Figure 2: Comparison of prediction accuracy across different time horizons',
				width: '70%'
			}
		],
		tables: [
			{
				type: 'table',
				headers: ['Method', 'MAE (mg/dL)', 'RMSE (mg/dL)', 'R²'],
				rows: [
					['Linear Regression', '12.4', '16.8', '0.72'],
					['Random Forest', '9.8', '13.2', '0.81'],
					['LSTM', '8.9', '12.1', '0.84'],
					['Proposed Method', '8.2', '11.3', '0.87']
				],
				caption: 'Table 1: Performance comparison of different prediction methods'
			}
		],
		references: [
			{
				type: 'reference',
				id: 'smith2023',
				title: 'Advances in Continuous Glucose Monitoring',
				authors: ['Smith, J.', 'Brown, A.'],
				year: 2023,
				journal: 'Journal of Biomedical Engineering',
				url: 'https://example.com/paper1'
			},
			{
				type: 'reference',
				id: 'doe2022',
				title: 'Machine Learning for Healthcare Applications',
				authors: ['Doe, J.', 'Wilson, K.', 'Taylor, M.'],
				year: 2022,
				journal: 'Nature Machine Intelligence'
			}
		],
		metadata: {
			created: '2024-01-15',
			modified: '2024-01-20',
			keywords: ['machine learning', 'metabolic sensors', 'glucose monitoring', 'predictive modeling']
		}
	};
}
