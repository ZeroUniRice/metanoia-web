/**
 * This script pre-processes branch data for static site generation.
 * It reads the data from the static folder and creates a JS file with the data.
 */
import fs from 'fs';
import path from 'path';

const STATIC_DIR = path.resolve('static');
const BRANCHES_DIR = path.join(STATIC_DIR, 'branches');
const OUTPUT_FILE = path.resolve('src', 'lib', 'branchData.js');

// Function that mimics the parseBranchSummary function from branches.ts
function parseBranchSummary(name, route, content) {
  const contentMatch = content.match(/\[CONTENT\]\s*([\s\S]*)/);
  const extractedContent = contentMatch ? contentMatch[1].trim() : content;
  
  return {
    name,
    route,
    content: extractedContent
  };
}

// Make sure the branches directory exists
if (!fs.existsSync(BRANCHES_DIR)) {
  console.error('Error: branches directory not found in static folder');
  process.exit(1);
}

// Get all subdirectories in the branches folder
try {
  const files = fs.readdirSync(BRANCHES_DIR);
  const directories = files.filter(file => {
    const filePath = path.join(BRANCHES_DIR, file);
    return fs.statSync(filePath).isDirectory();
  });

  const branchData = [];
    // Process each directory
  for (const branchName of directories) {
    const branchPath = `/branches/${branchName}`;
    const summaryPath = path.join(BRANCHES_DIR, branchName, 'summary.txt');
    
    if (fs.existsSync(summaryPath)) {
      const content = fs.readFileSync(summaryPath, 'utf8');
      const parsedBranch = parseBranchSummary(branchName, branchPath, content);
      branchData.push(parsedBranch);
    }
  }

  // Write the processed data to the output file
  fs.writeFileSync(
    OUTPUT_FILE, 
    `// Auto-generated file - DO NOT EDIT\n// This file contains pre-processed branch data for static site generation\n\nexport default ${JSON.stringify(branchData, null, 2)};`
  );
  
  console.log(`Generated branch data with ${branchData.length} branches`);
} catch (error) {
  console.error('Error generating branch data:', error);
  process.exit(1);
}
