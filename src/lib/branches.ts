import type { Branch, Article } from './types.js';
import { browser } from '$app/environment';

/**
 * Data that's available at build time for static site generation
 * This will be populated by the build script during prerendering
 */
import branchData from './branchData.js';

export async function loadBranches(): Promise<Branch[]> {
	// For static site generation, always use the pre-built data
	// This ensures consistency across browser and SSR environments
	return branchData;
}

export async function getBranchBySlug(slug: string): Promise<Branch | null> {
	const branches = await loadBranches();
	return branches.find(branch => branch.slug === slug) || null;
}

export async function getArticleBySlug(branchSlug: string, articleSlug: string): Promise<{ branch: Branch; article: Article } | null> {
	const branch = await getBranchBySlug(branchSlug);
	if (!branch) return null;
	
	const article = branch.articles.find(article => article.slug === articleSlug);
	if (!article) return null;
	
	return { branch, article };
}
