/**
 * PDF to HTML conversion utilities for static site generation
 * This module handles converting PDFs to HTML during the build process
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Converts a Windows path to a WSL-compatible path without changing case.
 * @param {string} winPath The Windows-style path (e.g., C:\Users\Test)
 * @returns {string} The WSL-style path (e.g., /mnt/c/Users/Test)
 */
function toWslPath(winPath) {
    if (!winPath || typeof winPath !== 'string') return '';
    let posixPath = winPath.replace(/\\/g, '/');
    posixPath = posixPath.replace(/^([A-Z]):/i, (match, p1) => `/mnt/${p1.toLowerCase()}`);
    return posixPath;
}

/**
 * Convert a PDF file to HTML using pdf2htmlEX
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputDir - Directory to save the HTML file
 * @returns {Promise<string|null>} - Path to the generated HTML file
 */
export async function convertPDFToHTML(pdfPath, outputDir) {
	try {
		// Check if pdf2htmlEX is available
		let pdf2htmlEXPath = null;
		const possiblePaths = [
			'pdf2htmlEX',
			'/usr/bin/pdf2htmlEX',
			'/usr/local/bin/pdf2htmlEX',
			'wsl pdf2htmlEX',
			'wsl.exe pdf2htmlEX'
		];
		
		console.log(`  🔍 Searching for pdf2htmlEX in multiple locations...`);
		
		for (const cmdPath of possiblePaths) {
			try {
				console.log(`    Trying: ${cmdPath}`);
				execSync(`${cmdPath} --version`, { stdio: 'ignore', timeout: 10000 });
				pdf2htmlEXPath = cmdPath;
				console.log(`    ✓ Found pdf2htmlEX at: ${cmdPath}`);
				break;
			} catch (error) {
				console.log(`    ✗ Not found: ${cmdPath}`);
			}
		}
		
		if (!pdf2htmlEXPath) {
			console.warn('  ⚠ pdf2htmlEX not found in any location. PDF will be displayed as iframe.');
			console.warn('     If you have pdf2htmlEX in WSL, make sure WSL is accessible from your current environment.');
			return null;
		}

		console.log(`     Using pdf2htmlEX at: ${pdf2htmlEXPath}`);

		const pdfBasename = path.basename(pdfPath, '.pdf');
		const htmlOutputPath = path.join(outputDir, `${pdfBasename}.html`);
		
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		const isWsl = pdf2htmlEXPath.includes('wsl');

		const commandPdfPath = isWsl ? toWslPath(pdfPath) : `"${pdfPath}"`;
		const commandOutputDir = isWsl ? toWslPath(outputDir) : `"${outputDir}"`;
		
		const command = [
			pdf2htmlEXPath,
			`"${commandPdfPath}"`,
			`"${pdfBasename}.html"`,
			`--dest-dir "${commandOutputDir}"`,
			'--embed-css 1',
			'--embed-font 0',
			'--embed-image 0',
			'--bg-format png',
			'--embed-javascript 0',
			'--process-outline 0',
			'--printing 0',
			'--no-drm 1'
		].join(' ');

		console.log(`  Converting PDF to HTML: ${pdfBasename}`);
		console.log(`  Command: ${command}`);
		execSync(command, { stdio: 'inherit', timeout: 30000 });

		if (fs.existsSync(htmlOutputPath)) {
			console.log(`  ✓ Generated HTML: ${htmlOutputPath}`);
			return htmlOutputPath;
		} else {
			console.error(`  ✗ Failed to generate HTML for ${pdfPath}`);
			return null;
		}
	} catch (error) {
		console.error(`  ✗ Error converting PDF to HTML: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}

/**
 * Post-process converted HTML to integrate with site styling
 * @param {string} htmlPath - Path to the generated HTML file
 * @param {string} articleTitle - Title of the article
 * @param {string[]} authors - Array of authors
 */
export async function postProcessHTML(htmlPath, articleTitle, authors) {
	try {
		if (!fs.existsSync(htmlPath)) {
			return;
		}

		let htmlContent = fs.readFileSync(htmlPath, 'utf8');

		const customCSS = `
		<style>
			/* Custom styles for PDF-converted content */
			body {
				background-color: white;
				color: #111827;
			}
			
			/* Dark mode styles */
			.dark body {
				background-color: #111827;
				color: #f9fafb;
			}
			
			/* Override PDF conversion styles for better web integration */
			#page-container {
				margin: 0 auto;
				max-width: 64rem;
			}
			
			.pf {
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
				border-radius: 0.5rem;
				background-color: white;
				margin-bottom: 1.5rem;
				border: 1px solid #e5e7eb;
			}
			
			.dark .pf {
				background-color: #1f2937;
				border-color: #374151;
			}
			
			/* Typography improvements */
			.pdf-text {
				color: #111827;
				line-height: 1.6;
			}
			
			.dark .pdf-text {
				color: #f9fafb;
			}
			
			.dark .pdf-title {
				color: #f3f4f6;
			}
			
			/* Links */
			a {
				color: #3b82f6;
				text-decoration: none;
			}
			
			a:hover {
				color: #1d4ed8;
			}
			
			.dark a {
				color: #60a5fa;
			}
			
			.dark a:hover {
				color: white;
			}
			
			/* Hide the custom header since ArticleViewer provides its own */
			.article-header {
				display: none;
			}
		</style>
		`;

		const headerHTML = `
		<div class="article-header mb-8 p-6 bg-gradient-to-r from-primary-light to-primary-default text-white rounded-lg">
			<h1 class="text-3xl font-bold mb-2">${articleTitle}</h1>
			${authors.length > 0 ? `<p class="text-lg opacity-90">By ${authors.join(', ')}</p>` : ''}
		</div>
		`;

		htmlContent = htmlContent.replace('<head>', `<head>${customCSS}`);
		htmlContent = htmlContent.replace('<body>', `<body><div class="container mx-auto py-8">${headerHTML}`);
		htmlContent = htmlContent.replace('</body>', '</div></body>');

		fs.writeFileSync(htmlPath, htmlContent, 'utf8');
		console.log(`  ✓ Post-processed HTML with custom styling`);
	} catch (error) {
		console.error(`  ✗ Error post-processing HTML: ${error}`);
	}
}

/**
 * Check if pdf2htmlEX is available on the system
 */
export function isPdf2HtmlEXAvailable() {
	try {
		const commands = [
			'pdf2htmlEX --version',
			'which pdf2htmlEX',
			'/usr/bin/pdf2htmlEX --version',
			'/usr/local/bin/pdf2htmlEX --version',
			'wsl pdf2htmlEX --version',
			'wsl.exe pdf2htmlEX --version'
		];
		
		for (const cmd of commands) {
			try {
				execSync(cmd, { stdio: 'ignore', timeout: 10000 });
				console.log(`  ✓ Found pdf2htmlEX using: ${cmd.split(' ')[0]}`);
				return true;
			} catch (error) {
				// Continue to next command
			}
		}
		
		return false;
	} catch (error) {
		return false;
	}
}