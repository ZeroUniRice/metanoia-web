import type { BranchSummary } from './types.js';

// Base path for all branch content
const BRANCHES_BASE_PATH = '/branches';

export async function loadBranches(): Promise<BranchSummary[]> {
	try {
		// First, fetch the directory listing
		const dirListingResponse = await fetch(`${BRANCHES_BASE_PATH}/_index.json`);
		
		if (!dirListingResponse.ok) {
			console.error('Failed to load branch directory listing');
			return [];
		}
		
		// Parse the directory listing which contains names of subdirectories
		const branchDirs = await dirListingResponse.json();
		const branches: BranchSummary[] = [];
		
		// Load each branch's summary
		for (const branchName of branchDirs) {
			const path = `${BRANCHES_BASE_PATH}/${branchName}`;
			const branchResponse = await fetch(`${path}/summary.txt`);
			
			if (branchResponse.ok) {
				const content = await branchResponse.text();
				const parsedBranch = parseBranchSummary(branchName, path, content);
				branches.push(parsedBranch);
			}
		}
		
		return branches;
	} catch (error) {
		console.error('Error loading branches:', error);
		return [];
	}
}

function parseBranchSummary(name: string, route: string, content: string): BranchSummary {
	const contentMatch = content.match(/\[CONTENT\]\s*([\s\S]*)/);
	const extractedContent = contentMatch ? contentMatch[1].trim() : content;
	
	return {
		name,
		route,
		content: extractedContent
	};
}
