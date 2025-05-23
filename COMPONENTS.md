/**
 * @file components/PersonCard.svelte
 * @description
 *   A reusable card component for displaying individual team member information.
 *   Takes a Person object containing image URL, name, and contact information.
 *   Displays these in a clean, responsive card layout with rounded profile image.
 */

/**
 * @file components/PeopleGallery.svelte
 * @description
 *   A carousel/gallery component for displaying multiple PersonCard components.
 *   Features navigation arrows and dot indicators when there are multiple people.
 *   Automatically handles single-person display without navigation controls.
 *   Uses smooth CSS transitions for slide animations.
 */

/**
 * @file components/BranchCard.svelte
 * @description
 *   A card component for displaying project branch summaries.
 *   Takes a BranchSummary object and renders the parsed markdown content.
 *   Includes a link to the detailed branch page using the branch route.
 *   Content is parsed using the custom markdown parser for consistent styling.
 */

/**
 * @file lib/markdown.ts
 * @description
 *   A lightweight, single-pass markdown parser supporting basic formatting.
 *   Supports headings (h1-h6), bold text, italic text, and images.
 *   Outputs HTML with Tailwind CSS classes for consistent styling.
 *   Designed specifically for the limited markdown features used in branch summaries.
 */

/**
 * @file lib/branches.ts
 * @description
 *   Utility functions for loading and parsing branch data from static files.
 *   Handles fetching summary.txt files from the static/branches directory.
 *   Parses content tags (currently [CONTENT]) to extract relevant information.
 *   Returns structured BranchSummary objects for use in components.
 */
