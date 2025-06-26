export interface Person {
	image: string;
	name: string;
	contact: string;
}

export interface Article {
	title: string;
	slug: string;
	route: string;
	authors: string[];
	abstract: string;
	pdfPath: string;
	lightPdfPath?: string; // Path to light-themed PDF version
	darkPdfPath?: string; // Path to dark-themed PDF version
	thumbnailPath?: string;
	htmlPath?: string; // Path to converted HTML version of the PDF
}

export interface Branch {
	name: string;
	slug: string;
	route: string;
	content: string;
	bannerImage?: string;
	standardImage?: string;
	articles: Article[];
	articleCount: number;
	recentArticles: Article[];
}

// Legacy interfaces for backward compatibility
export interface BranchSummary {
	name: string;
	content: string;
	route: string;
}

export interface PDFSection {
	type: 'section' | 'subsection' | 'subsubsection';
	title: string;
	content: string;
	level: number;
}

export interface PDFMath {
	type: 'inline' | 'display';
	latex: string;
	description?: string;
}

export interface PDFFigure {
	type: 'figure';
	src: string;
	caption: string;
	alt: string;
	width?: string;
	height?: string;
}

export interface PDFTable {
	type: 'table';
	headers: string[];
	rows: string[][];
	caption?: string;
}

export interface PDFReference {
	type: 'reference';
	id: string;
	title: string;
	authors: string[];
	year: number;
	journal?: string;
	url?: string;
}

export interface PDFContent {
	title: string;
	authors: string[];
	abstract?: string;
	sections: PDFSection[];
	math?: PDFMath[];
	figures?: PDFFigure[];
	tables?: PDFTable[];
	references?: PDFReference[];
	metadata?: {
		created: string;
		modified: string;
		keywords: string[];
	};
}

export interface IEEEPaper {
	title: string;
	authors: string[];
	abstract: string;
	keywords: string[];
	conference?: string;
	year?: number;
	doi?: string;
	pdfPath?: string;
	thumbnailPath?: string;
	content: PDFContent;
}

export interface PaperMetadata {
	title: string;
	authors: string[];
	abstract: string;
	keywords: string[];
	conference?: string;
	year?: number;
	doi?: string;
	pdfFileName?: string;
	thumbnailFileName?: string;
}

export interface BranchData {
	name: string;
	slug: string;
	route: string;
	content: string;
	bannerImage?: string;
	standardImage?: string;
	articles: Article[];
	articleCount: number;
	recentArticles: Article[];
}
