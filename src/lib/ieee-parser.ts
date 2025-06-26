// IEEE Conference Paper Parser
import type { IEEEPaper, PaperMetadata, PDFContent, PDFSection, PDFFigure, PDFTable, PDFReference } from './types.js';
import { base } from '$app/environment';

/**
 * Parse metadata text file with IEEE paper information
 */
export function parseMetadataFile(content: string): PaperMetadata {
	const lines = content.split('\n').map(line => line.trim());
	const metadata: PaperMetadata = {
		title: '',
		authors: [],
		abstract: '',
		keywords: []
	};

	let currentSection = '';
	let sectionContent = '';

	for (const line of lines) {
		// Check for section markers
		if (line.startsWith('[') && line.endsWith(']')) {
			// Process previous section
			if (currentSection && sectionContent) {
				processSectionContent(metadata, currentSection, sectionContent.trim());
			}
			currentSection = line.slice(1, -1).toLowerCase();
			sectionContent = '';
		} else if (line) {
			sectionContent += line + '\n';
		}
	}

	// Process the last section
	if (currentSection && sectionContent) {
		processSectionContent(metadata, currentSection, sectionContent.trim());
	}

	return metadata;
}

function processSectionContent(metadata: PaperMetadata, section: string, content: string) {
	switch (section) {
		case 'title':
			metadata.title = content;
			break;
		case 'authors':
			metadata.authors = content.split(',').map(author => author.trim());
			break;
		case 'abstract':
			metadata.abstract = content;
			break;
		case 'keywords':
			metadata.keywords = content.split(',').map(keyword => keyword.trim());
			break;
		case 'conference':
			metadata.conference = content;
			break;
		case 'year':
			metadata.year = parseInt(content);
			break;
		case 'doi':
			metadata.doi = content;
			break;
		case 'pdf':
			metadata.pdfFileName = content;
			break;
		case 'thumbnail':
			metadata.thumbnailFileName = content;
			break;
	}
}

/**
 * Load and parse an IEEE paper from a directory
 */
export async function loadIEEEPaper(paperPath: string): Promise<IEEEPaper | null> {
	try {
		// Load metadata file
		const metadataResponse = await fetch(`${paperPath}/metadata.txt`);
		if (!metadataResponse.ok) {
			console.error(`Failed to load metadata from ${paperPath}`);
			return null;
		}

		const metadataContent = await metadataResponse.text();
		const metadata = parseMetadataFile(metadataContent);

		// Load PDF content if available
		let pdfContent: PDFContent | null = null;
		if (metadata.pdfFileName) {
			pdfContent = await loadPDFContent(`${paperPath}/${metadata.pdfFileName}`);
		}

		// Create IEEE paper object
		const paper: IEEEPaper = {
			...metadata,
			pdfPath: metadata.pdfFileName ? `${paperPath}/${metadata.pdfFileName}` : undefined,
			thumbnailPath: metadata.thumbnailFileName ? `${paperPath}/${metadata.thumbnailFileName}` : undefined,
			content: pdfContent || createEmptyPDFContent()
		};

		return paper;
	} catch (error) {
		console.error(`Error loading IEEE paper from ${paperPath}:`, error);
		return null;
	}
}

/**
 * Simulate PDF content extraction (in a real implementation, this would use PDF.js or similar)
 */
async function loadPDFContent(pdfPath: string): Promise<PDFContent> {
	// For now, we'll create structured content based on IEEE format
	// In a real implementation, you'd use PDF.js to extract text, images, and structure
	
	return {
		title: "Extracted from PDF",
		authors: [],
		sections: [
			{
				type: 'section',
				title: 'Introduction',
				content: '<p>This content would be extracted from the PDF file.</p>',
				level: 1
			}
		]
	};
}

function createEmptyPDFContent(): PDFContent {	return {
		title: '',
		authors: [],
		sections: []
	};
}