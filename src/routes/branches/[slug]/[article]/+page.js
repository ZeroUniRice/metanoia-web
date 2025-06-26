import { error } from '@sveltejs/kit';
import branchData from '$lib/branchData.js';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const { slug, article } = params;
	
	// Find the branch
	const branch = branchData.find(b => b.slug === slug);
	if (!branch) {
		throw error(404, 'Branch not found');
	}
	
	// Find the article
	const articleData = branch.articles.find(a => a.slug === article);
	if (!articleData) {
		throw error(404, 'Article not found');
	}
	
	return {
		branch,
		article: articleData
	};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	const routes = [];
	
	for (const branch of branchData) {
		for (const article of branch.articles) {
			routes.push({
				slug: branch.slug,
				article: article.slug
			});
		}
	}
	
	return routes;
}

// Enable prerendering for this route
export const prerender = true;
