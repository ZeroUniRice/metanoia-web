/**
 * This script pre-processes branch and article data for static site generation.
 * Structure: branches contain articles, articles contain PDFs
 */
import fs from 'fs';
import path from 'path';
import { convertPDFToHTML, postProcessHTML, isPdf2HtmlEXAvailable } from '../src/lib/pdf-to-html.js';
import { execSync } from 'child_process';

const STATIC_DIR = path.resolve('static');
const BRANCHES_DIR = path.join(STATIC_DIR, 'branches');
const OUTPUT_FILE = path.resolve('src', 'lib', 'branchData.js');

console.log('Checking for pdf2htmlEX availability...');
const pdfToolCheck = isPdf2HtmlEXAvailable();
if (pdfToolCheck) {
  console.log('✓ pdf2htmlEX found - PDFs will be converted to HTML');
} else {
  console.log('    pdf2htmlEX not found - PDFs will be displayed as iframes');
}
console.log('');


function parseSummaryFile(filePath, expectedTags = ['CONTENT']) {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  
  for (const tag of expectedTags) {
    const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      result[tag.toLowerCase()] = match[1].trim();
      
      if (tag === 'AUTHORS') {
        result.authors = result.authors
          .split(/[,\n]/)
          .map(author => author.trim())
          .filter(author => author.length > 0);
      }
    }
  }
  
  return result;
}

function isPDFFile(filename) {
  return filename.toLowerCase().endsWith('.pdf');
}

function ensureThemeDirectories(articleDir) {
  const lightDir = path.join(articleDir, 'light');
  const darkDir = path.join(articleDir, 'dark');
  
  if (!fs.existsSync(lightDir)) {
    fs.mkdirSync(lightDir, { recursive: true });
  }
  
  if (!fs.existsSync(darkDir)) {
    fs.mkdirSync(darkDir, { recursive: true });
  }
  
  return { lightDir, darkDir };
}

function isThumbnailFile(filename) {
  return /\.(png|jpg|jpeg|webp)$/i.test(filename);
}

if (!fs.existsSync(BRANCHES_DIR)) {
  console.error('Error: branches directory not found in static folder');
  process.exit(1);
}

/**
 * Detects if Ghostscript is available on the system
 */
function detectGhostscript() {
    console.log(`  🔍 Searching for Ghostscript in multiple locations...`);
    
    const possibleCommands = [
        'gs',
        'gswin64c', 
        'gswin32c',
        'wsl gs',
        'wsl.exe gs'
    ];
    
    for (const cmd of possibleCommands) {
        try {
            console.log(`    Trying: ${cmd}`);
            execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 10000 });
            console.log(`    ✓ Found Ghostscript at: ${cmd}`);
            return cmd;
        } catch (error) {
            console.log(`    ✗ Not found: ${cmd}`);
        }
    }
    
    const commonPaths = [
        '/usr/bin/gs',
        '/usr/local/bin/gs'
    ];
    
    const windowsPaths = [
        'C:\\Program Files\\gs\\gs*\\bin\\gswin64c.exe',
        'C:\\Program Files (x86)\\gs\\gs*\\bin\\gswin32c.exe'
    ];
    
    for (const gsPath of [...commonPaths, ...windowsPaths]) {
        try {
            if (gsPath.includes('*')) {
                const baseDir = path.dirname(path.dirname(gsPath));
                if (fs.existsSync(baseDir)) {
                    const versions = fs.readdirSync(baseDir).filter(dir => dir.startsWith('gs'));
                    if (versions.length > 0) {
                        const fullPath = path.join(baseDir, versions[0], 'bin', path.basename(gsPath));
                        if (fs.existsSync(fullPath)) {
                            console.log(`    ✓ Found Ghostscript at: ${fullPath}`);
                            return `"${fullPath}"`;
                        }
                    }
                }
            } else if (fs.existsSync(gsPath)) {
                console.log(`    ✓ Found Ghostscript at: ${gsPath}`);
                return gsPath;
            }
        } catch (error) {
        }
    }
    
    console.log('  ⚠ Ghostscript not found in any location.');
    console.log('     If you have Ghostscript in WSL, make sure WSL is accessible from your current environment.');
    console.log('     Install with: apt install ghostscript (Linux) or download from https://www.ghostscript.com/');
    return null;
}

/**
 * Generates themed PDFs with modified background colors in dedicated subdirectories
 */
async function generateThemedPDFs(pdfPath, articleDir) {
    const gsCommand = detectGhostscript();
    if (!gsCommand) {
        return { lightPdf: null, darkPdf: null };
    }
    
    const { lightDir, darkDir } = ensureThemeDirectories(articleDir);
    const baseName = path.basename(pdfPath, '.pdf');
    const lightPdfPath = path.join(lightDir, `${baseName}.pdf`);
    const darkPdfPath = path.join(darkDir, `${baseName}.pdf`);
    
    try {
        console.log(`  Generating light themed PDF: ${path.basename(lightPdfPath)}`);
        
        // Create PostScript file for light theme (clean white background)
        const lightScriptPath = path.join(lightDir, `${baseName}.ps`);
        const lightScript = `%!PS-Adobe-3.0
% Light theme - ensure clean white background
<<
    /BeginPage {
        gsave
        % Set clean white background
        1 1 1 setrgbcolor
        % Get page dimensions
        /PageSize currentpagedevice /PageSize get def
        /PageWidth PageSize 0 get def
        /PageHeight PageSize 1 get def
        % Draw and fill a rectangle covering the entire page
        0 0 PageWidth PageHeight rectfill
        grestore
    } bind
>> setpagedevice
`;
        
        let commandPdfPath = pdfPath;
        
        try {
            fs.writeFileSync(lightScriptPath, lightScript);
            
            let commandLightPdfPath = lightPdfPath;
            
            if (gsCommand.includes('wsl')) {
                commandPdfPath = pdfPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
                commandLightPdfPath = lightPdfPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
            }
            
            const lightCommand = `${gsCommand} -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sOutputFile="${commandLightPdfPath}" "${lightScriptPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/')}" "${commandPdfPath}"`;
            const lightResult = execSync(lightCommand, { encoding: 'utf8', stdio: 'pipe' });
            console.log(`    ✓ Light PDF created successfully`);
            
            fs.unlinkSync(lightScriptPath);
        } catch (error) {
            console.error(`    ✗ Light PDF failed: ${error.message}`);
            if (error.stderr) console.error(`    Stderr: ${error.stderr}`);
            
            if (fs.existsSync(lightScriptPath)) {
                fs.unlinkSync(lightScriptPath);
            }
            throw error;
        }
        
        console.log(`  Generating dark themed PDF: ${path.basename(darkPdfPath)}`);
        
        // Create PostScript file for dark theme
        const darkScriptPath = path.join(darkDir, `${baseName}.ps`);
        const darkScript = `%!PS-Adobe-3.0
% Dark theme - dark background matching our CSS theme
<<
    /BeginPage {
        gsave
        % Set dark background color (matching CSS: rgb(31, 41, 55) = #1f2937)
        0.1216 0.1608 0.2157 setrgbcolor
        % Get page dimensions
        /PageSize currentpagedevice /PageSize get def
        /PageWidth PageSize 0 get def
        /PageHeight PageSize 1 get def
        % Draw and fill a rectangle covering the entire page
        0 0 PageWidth PageHeight rectfill
        grestore
    } bind
>> setpagedevice
`;
        
        try {
            fs.writeFileSync(darkScriptPath, darkScript);
            
            let commandDarkPdfPath = darkPdfPath;
            
            if (gsCommand.includes('wsl')) {
                commandDarkPdfPath = darkPdfPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
            }
            
            const darkCommand = `${gsCommand} -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sOutputFile="${commandDarkPdfPath}" "${darkScriptPath.replace(/^([A-Z]):/i, '/mnt/$1').toLowerCase().replace(/\\/g, '/')}" "${commandPdfPath}"`;
            console.log(`    Running command: ${darkCommand}`);
            const darkResult = execSync(darkCommand, { encoding: 'utf8', stdio: 'pipe' });
            console.log(`    ✓ Dark PDF created successfully`);
            
            fs.unlinkSync(darkScriptPath);
        } catch (error) {
            console.error(`    ✗ Dark PDF failed: ${error.message}`);
            if (error.stderr) console.error(`    Stderr: ${error.stderr}`);
            
            if (fs.existsSync(darkScriptPath)) {
                fs.unlinkSync(darkScriptPath);
            }
            throw error;
        }
        
        console.log(`  ✓ Created themed PDFs in subdirectories`);
        
        return {
            lightPdf: lightPdfPath,
            darkPdf: darkPdfPath,
            lightDir,
            darkDir
        };
        
    } catch (error) {
        console.error(`  ✗ Failed to generate themed PDFs: ${error.message}`);
        
        [lightPdfPath, darkPdfPath].forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        });
        
        return { lightPdf: null, darkPdf: null };
    }
}

async function generateBranchData() {
  try {
    const branchDirs = fs.readdirSync(BRANCHES_DIR).filter(file => {
      const filePath = path.join(BRANCHES_DIR, file);
      return fs.statSync(filePath).isDirectory();
    });

    const branchesData = [];

    for (const branchName of branchDirs) {
      console.log(`Processing branch: ${branchName}`);
      
      const branchDir = path.join(BRANCHES_DIR, branchName);
      const branchSummaryPath = path.join(branchDir, 'summary.txt');
      
      const branchSummary = parseSummaryFile(branchSummaryPath, ['NAME', 'CONTENT']);
      if (!branchSummary) {
        console.log(`  ⚠ No summary.txt found for branch ${branchName}, skipping`);
        continue;
      }
    
    // Find branch thumbnails
    const bannerPath = fs.existsSync(path.join(branchDir, 'banner.png')) 
      ? `/branches/${branchName}/banner.png` : null;
    const standardPath = fs.existsSync(path.join(branchDir, 'standard.png'))
      ? `/branches/${branchName}/standard.png` : null;
    
    const branch = {
      name: branchSummary.name || branchName,
      slug: branchName,
      route: `/branches/${branchName}`,
      content: branchSummary.content || '',
      bannerImage: bannerPath,
      standardImage: standardPath,
      articles: [],
      articleCount: 0,
      recentArticles: []
    };
    
    // Get all subdirectories (articles) in the branch
    const articleDirs = fs.readdirSync(branchDir).filter(file => {
      const filePath = path.join(branchDir, file);
      return fs.statSync(filePath).isDirectory();
    });
    
    console.log(`  Found ${articleDirs.length} article directories`);
    
    // Process each article directory
    for (const articleName of articleDirs) {
      console.log(`    Processing article: ${articleName}`);
      
      const articleDir = path.join(branchDir, articleName);
      const articleSummaryPath = path.join(articleDir, 'summary.txt');
      
      // Parse article summary
      const articleSummary = parseSummaryFile(articleSummaryPath, ['CONTENT', 'AUTHORS']);
      if (!articleSummary) {
        console.log(`      ⚠ No summary.txt found for article ${articleName}, skipping`);
        continue;
      }
      
      const articleFiles = fs.readdirSync(articleDir).filter(file => {
        const filePath = path.join(articleDir, file);
        return fs.statSync(filePath).isFile();
      });
      
      const pdfFiles = articleFiles.filter(isPDFFile);
      const thumbnailFiles = articleFiles.filter(isThumbnailFile);
      
      if (pdfFiles.length === 0) {
        console.log(`      ⚠ No PDF found for article ${articleName}, skipping`);
        continue;
      }
      
      const pdfFile = pdfFiles[0];
      const thumbnailFile = thumbnailFiles[0];
      
      console.log(`          Processing PDF: ${pdfFile}`);
      
      const pdfFullPath = path.join(articleDir, pdfFile);
      console.log(`         Generating themed PDFs for: ${pdfFile}`);
      const themedPdfs = await generateThemedPDFs(pdfFullPath, articleDir);
      
      const baseName = path.basename(pdfFile, '.pdf');
      const basePath = `/branches/${branchName}/${articleName}/${baseName}`;
      
      const article = {
        title: articleSummary.content.split('\n')[0].replace(/^#\s*/, ''), 
        slug: articleName,
        route: `/branches/${branchName}/${articleName}`,
        authors: articleSummary.authors || [],
        abstract: articleSummary.content,
        basePath: basePath,
        thumbnailPath: thumbnailFile ? `/branches/${branchName}/${articleName}/${thumbnailFile}` : null,
        hasHtml: false
      };
      
      let htmlConversionSuccess = false;
      
      try {
        console.log(`         Attempting themed PDF to HTML conversions`);
        
        if (themedPdfs.lightPdf && fs.existsSync(themedPdfs.lightPdf)) {
          console.log(`          Converting light PDF: ${path.basename(themedPdfs.lightPdf)}`);
          const lightHtmlPath = await convertPDFToHTML(themedPdfs.lightPdf, themedPdfs.lightDir);
          
          if (lightHtmlPath) {
            await postProcessHTML(lightHtmlPath, article.title, article.authors);
            console.log(`      ✓ Light HTML conversion completed`);
            htmlConversionSuccess = true;
          }
        }
        
        if (themedPdfs.darkPdf && fs.existsSync(themedPdfs.darkPdf)) {
          console.log(`          Converting dark PDF: ${path.basename(themedPdfs.darkPdf)}`);
          const darkHtmlPath = await convertPDFToHTML(themedPdfs.darkPdf, themedPdfs.darkDir);
          
          if (darkHtmlPath) {
            await postProcessHTML(darkHtmlPath, article.title, article.authors);
            console.log(`      ✓ Dark HTML conversion completed`);
            htmlConversionSuccess = true;
          }
        }
        
        article.hasHtml = htmlConversionSuccess;
        
        if (htmlConversionSuccess) {
          console.log(`      ✓ Themed HTML conversions completed for: ${baseName}`);
        } else {
          console.log(`      ⚠ PDF-to-HTML conversion not available, will use PDF iframe`);
        }
      } catch (error) {
        console.error(`      ✗ PDF conversion failed: ${error.message}`);
      }
      
      branch.articles.push(article);
      console.log(`      ✓ Added article: "${article.title}" by ${article.authors.join(', ') || 'Unknown authors'}`);
    }
    
    branch.articleCount = branch.articles.length;
    branch.recentArticles = branch.articles.slice(-3).reverse(); // Last 3 articles, most recent first
    
    branchesData.push(branch);
    console.log(`  ✓ Branch completed: ${branch.articles.length} articles`);
  }

  fs.writeFileSync(
    OUTPUT_FILE, 
    `// Auto-generated file - DO NOT EDIT
// This file contains pre-processed branch and article data for static site generation

export default ${JSON.stringify(branchesData, null, 2)};`
  );
  
  const totalArticles = branchesData.reduce((sum, branch) => sum + branch.articleCount, 0);
  console.log(`Generated data: ${branchesData.length} branches, ${totalArticles} articles`);
  
  } catch (error) {
    console.error('Error generating branch data:', error);
    process.exit(1);
  }
}

generateBranchData();