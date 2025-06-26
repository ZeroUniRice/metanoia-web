import branchData from '$lib/branchData.js';

// This tells SvelteKit which [slug] routes to pre-render at build time
export async function entries() {
	return branchData.map(branch => ({
		slug: branch.slug
	}));
}

// Enable prerendering for this route
export const prerender = true;
