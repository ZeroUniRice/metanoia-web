// @ts-nocheck
import * as pdfjsLib from 'pdfjs-dist';
import { readFileSync } from 'fs';
// DEPRECATED: Not worth continuing with this

/**
 * Parse an IEEE PDF file and extract metadata and content
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<any>} Parsed paper data
 */
export async function parseIEEEPDF(pdfPath) {
	try {
		const pdfBuffer = readFileSync(pdfPath);
		const pdfDocument = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
		
		let fullText = '';
		const numPages = pdfDocument.numPages;
		
		// Extract text from all pages
		for (let pageNum = 1; pageNum <= numPages; pageNum++) {
			const page = await pdfDocument.getPage(pageNum);
			const textContent = await page.getTextContent();
			const pageText = textContent.items
				.filter(item => 'str' in item)
				.map(item => item.str)
				.join(' ');
			fullText += pageText + '\n';
		}
		
		// Parse the extracted text for IEEE format
		const paperData = parseIEEEText(fullText);
		
		return paperData;
	} catch (error) {
		console.error(`Error parsing PDF ${pdfPath}:`, error);
		return null;
	}
}

/**
 * Parse IEEE formatted text and extract structured data
 * @param {string} text - Raw text from PDF
 * @returns {any} Structured paper data
 */
function parseIEEEText(text) {
	const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
	
	const paper = {
		title: '',
		authors: [],
		abstract: '',
		keywords: [],
		conference: '',
		year: null,
		doi: '',
		content: {
			title: '',
			authors: [],
			abstract: '',
			sections: [],
			references: []
		}
	};
	
	// Find title (usually the first significant line, often in all caps or title case)
	for (let i = 0; i < Math.min(10, lines.length); i++) {
		if (lines[i].length > 10 && lines[i].length < 200 && 
			!lines[i].includes('IEEE') && 
			!lines[i].includes('Conference') &&
			!lines[i].match(/^\d+/) &&
			!lines[i].includes('@') &&
			lines[i].split(' ').length > 2) {
			paper.title = lines[i];
			paper.content.title = lines[i];
			break;
		}
	}
	
	// Find authors (typically follow the title, may contain email addresses)
	let authorStartIndex = -1;
	for (let i = 0; i < Math.min(20, lines.length); i++) {
		if (lines[i].includes('@') || 
			(lines[i].match(/[A-Z][a-z]+ [A-Z][a-z]+/) && lines[i].length < 100)) {
			authorStartIndex = i;
			break;
		}
	}
	
	if (authorStartIndex !== -1) {
		// Extract author names (before email addresses)
		let authorText = '';
		for (let i = authorStartIndex; i < Math.min(authorStartIndex + 5, lines.length); i++) {
			if (lines[i].toLowerCase().includes('abstract') || 
				lines[i].toLowerCase().includes('keywords')) {
				break;
			}
			authorText += lines[i] + ' ';
		}
		
		// Parse author names (remove emails and affiliations)
		const authorMatches = authorText.match(/([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
		if (authorMatches) {
			paper.authors = authorMatches.slice(0, 10); // Limit to reasonable number
			paper.content.authors = paper.authors;
		}
	}
	
	// Find abstract
	const abstractMatch = text.match(/Abstract[:\-\s]+(.*?)(?:Keywords|Index Terms|I\.\s+INTRODUCTION)/is);
	if (abstractMatch) {
		paper.abstract = cleanText(abstractMatch[1]);
		paper.content.abstract = paper.abstract;
	}
	
	// Find keywords
	const keywordsMatch = text.match(/(?:Keywords|Index Terms)[:\-\s]+(.*?)(?:\n\s*\n|\d+\.\s+|I\.\s+)/is);
	if (keywordsMatch) {
		const keywordText = keywordsMatch[1];
		paper.keywords = keywordText
			.split(/[,;]/)
			.map(k => k.trim())
			.filter(k => k.length > 0 && k.length < 50)
			.slice(0, 10);
	}
	
	// Find conference/publication info
	const conferenceMatch = text.match(/(IEEE.*?Conference|IEEE.*?Symposium|IEEE.*?Workshop)/i);
	if (conferenceMatch) {
		paper.conference = conferenceMatch[1];
	}
	
	// Find year
	const yearMatch = text.match(/\b(20\d{2})\b/);
	if (yearMatch) {
		paper.year = parseInt(yearMatch[1]);
	}
	
	// Find DOI
	const doiMatch = text.match(/DOI:?\s*(10\.\d+\/[^\s]+)/i);
	if (doiMatch) {
		paper.doi = doiMatch[1];
	}
	
	// Parse sections
	paper.content.sections = parseSections(text);
	
	// Parse references
	paper.content.references = parseReferences(text);
	
	return paper;
}

/**
 * Parse sections from IEEE paper text
 * @param {string} text - Full paper text
 * @returns {any[]} Array of section objects
 */
function parseSections(text) {
	const sections = [];
	
	// IEEE papers typically use Roman numerals or numbers for sections
	const sectionRegex = /(?:^|\n)\s*([IVX]+|[A-Z]|\d+)\.\s+([A-Z][A-Z\s]+)\n(.*?)(?=(?:\n\s*([IVX]+|[A-Z]|\d+)\.\s+[A-Z])|$)/gs;
	
	let match;
	while ((match = sectionRegex.exec(text)) !== null) {
		const [, number, title, content] = match;
		
		if (title && content && title.length < 100) {
			sections.push({
				type: 'section',
				title: title.trim(),
				content: cleanText(content),
				level: 1
			});
		}
	}
	
	// If no sections found with Roman numerals, try with regular numbers
	if (sections.length === 0) {
		const altSectionRegex = /(?:^|\n)\s*(\d+)\.\s+([A-Z][A-Z\s]+)\n(.*?)(?=(?:\n\s*\d+\.\s+[A-Z])|$)/gs;
		
		while ((match = altSectionRegex.exec(text)) !== null) {
			const [, number, title, content] = match;
			
			if (title && content && title.length < 100) {
				sections.push({
					type: 'section',
					title: title.trim(),
					content: cleanText(content),
					level: 1
				});
			}
		}
	}
	
	return sections.slice(0, 20); // Limit to reasonable number of sections
}

/**
 * Parse references from IEEE paper text
 * @param {string} text - Full paper text
 * @returns {any[]} Array of reference objects
 */
function parseReferences(text) {
	const references = [];
	
	// Find references section
	const referencesMatch = text.match(/(?:REFERENCES|References)\s*(.*?)$/is);
	if (!referencesMatch) return references;
	
	const referencesText = referencesMatch[1];
	
	// Parse individual references
	const refRegex = /\[(\d+)\]\s+(.*?)(?=\[\d+\]|$)/gs;
	let match;
	
	while ((match = refRegex.exec(referencesText)) !== null) {
		const [, id, refText] = match;
		
		// Try to extract title, authors, year from reference text
		const reference = {
			type: 'reference',
			id: id,
			title: '',
			authors: [],
			year: 0
		};
		
		// Extract year
		const yearMatch = refText.match(/\b(20\d{2}|19\d{2})\b/);
		if (yearMatch) {
			reference.year = parseInt(yearMatch[1]);
		}
		
		// Extract title (often in quotes or between commas)
		const titleMatch = refText.match(/"([^"]+)"/);
		if (titleMatch) {
			reference.title = titleMatch[1];
		} else {
			// Fallback: take first significant part
			const parts = refText.split(',');
			if (parts.length > 1) {
				reference.title = parts[1].trim();
			}
		}
		
		// Extract authors (usually at the beginning)
		const authorMatch = refText.match(/^([^,]+)/);
		if (authorMatch) {
			const authorText = authorMatch[1];
			// Split by "and" or "&"
			reference.authors = authorText
				.split(/\s+and\s+|\s+&\s+/)
				.map(author => author.trim())
				.filter(author => author.length > 0)
				.slice(0, 5);
		}
		
		if (reference.title && reference.authors.length > 0) {
			references.push(reference);
		}
	}
	
	return references.slice(0, 50); // Limit to reasonable number
}

/**
 * Clean and format text content
 * @param {string} text - Raw text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
	return text
		.replace(/\s+/g, ' ')
		.replace(/\n+/g, ' ')
		.replace(/[^\w\s.,;:!?()-]/g, '')
		.trim();
}
