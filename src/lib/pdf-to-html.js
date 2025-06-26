/**
 * PDF to HTML conversion utilities for static site generation
 * This module handles converting PDFs to HTML during the build process
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Convert a PDF file to HTML using pdf2htmlEX
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputDir - Directory to save the HTML file
 * @returns {Promise<string|null>} - Path to the generated HTML file
 */
export async function convertPDFToHTML(pdfPath, outputDir) {
	try {
		// Check if pdf2htmlEX is available with more thorough detection
		let pdf2htmlEXPath = null;
		const possiblePaths = [
			'pdf2htmlEX',
			'/usr/bin/pdf2htmlEX',
			'/usr/local/bin/pdf2htmlEX',
			'wsl pdf2htmlEX',  // Try through WSL if on Windows
			'wsl.exe pdf2htmlEX'  // Alternative WSL syntax
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
			console.warn('  💡 If you have pdf2htmlEX in WSL, make sure WSL is accessible from your current environment.');
			return null;
		}

		console.log(`  📄 Using pdf2htmlEX at: ${pdf2htmlEXPath}`);

		const pdfBasename = path.basename(pdfPath, '.pdf');
		const htmlOutputPath = path.join(outputDir, `${pdfBasename}.html`);
		
		// Ensure output directory exists
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Handle path conversion for WSL if needed
		let commandPdfPath = pdfPath;
		let commandOutputDir = outputDir;
		
		if (pdf2htmlEXPath.includes('wsl')) {
			// Convert Windows paths to WSL paths
			commandPdfPath = pdfPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
			commandOutputDir = outputDir.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
			console.log(`  🔄 Converting paths for WSL:`);
			console.log(`    PDF: ${pdfPath} → ${commandPdfPath}`);
			console.log(`    Output: ${outputDir} → ${commandOutputDir}`);
		}

		// Convert PDF to HTML with optimal settings for web display
		const command = `${pdf2htmlEXPath} "${commandPdfPath}" "${pdfBasename}.html" --dest-dir "${commandOutputDir}" --embed-css 1 --embed-javascript 1 --embed-font 1 --embed-image 1 --optimize-text 1 --space-threshold 0.125 --tounicode 1 --process-nontext 1`;
		
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

		// Add Tailwind CSS classes and custom styling
		const customCSS = `
		<style>
			/* Custom styles for PDF-converted content */
			body {
				background-color: white;
				color: #111827;
				font-family: system-ui, -apple-system, sans-serif;
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
				padding: 1.5rem;
			}
			
			.pf {
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
				border-radius: 0.5rem;
				background-color: white;
				margin-bottom: 1.5rem;
				padding: 2rem;
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
			
			/* Headers and titles */
			.pdf-title {
				font-size: 1.5rem;
				font-weight: 700;
				margin-bottom: 1rem;
				color: #1f2937;
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

		// Add custom header with article metadata
		const headerHTML = `
		<div class="article-header mb-8 p-6 bg-gradient-to-r from-primary-light to-primary-default text-white rounded-lg">
			<h1 class="text-3xl font-bold mb-2">${articleTitle}</h1>
			${authors.length > 0 ? `<p class="text-lg opacity-90">By ${authors.join(', ')}</p>` : ''}
		</div>
		`;

		// Insert custom styles and header
		htmlContent = htmlContent.replace('<head>', `<head>${customCSS}`);
		htmlContent = htmlContent.replace('<body>', `<body><div class="container mx-auto py-8">${headerHTML}`);
		htmlContent = htmlContent.replace('</body>', '</div></body>');

		// Write the processed HTML back
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
		// Try multiple ways to find pdf2htmlEX including WSL paths
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

/**
 * Generate installation instructions for pdf2htmlEX
 */
export function getPdf2HtmlEXInstallInstructions() {
	const platform = process.platform;
	
	switch (platform) {
		case 'win32':
			return `
Windows Installation:
1. Download pdf2htmlEX from: https://github.com/coolwanglu/pdf2htmlEX/releases
2. Extract and add to your PATH
3. Or use WSL with: sudo apt-get install pdf2htmlEX
			`.trim();
		case 'darwin':
			return `
macOS Installation:
brew install pdf2htmlex
			`.trim();
		case 'linux':
			return `
Linux Installation:
sudo apt-get install pdf2htmlex
# or
sudo yum install pdf2htmlEX
			`.trim();
		default:
			return 'Please install pdf2htmlEX from: https://github.com/coolwanglu/pdf2htmlEX';
	}
}
