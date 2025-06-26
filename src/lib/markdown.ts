/**
 * Markdown parser for the app
 * This parser is very basic and only supports a few features.
 * - Headings (h1-h6) [#]
 * - Bold text [**text**]
 * - Italic text [*text*]
 * - Images ![alt text](url)
 * @param markdown The markdown string to parse
 * @returns The parsed HTML string
 */
export function parseMarkdown(markdown: string): string {
	let html = markdown
		.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes, content) => {
			const level = hashes.length;
			return `<h${level} class="text-${7-level}xl font-bold mb-4 text-primary-dark dark:text-sunglow">${content}</h${level}>`;
		})
		.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
		.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
		.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">');

	if (!html.startsWith('<h')) {
		html = `<p class="mb-4 text-gray-700 dark:text-gray-300">${html}</p>`;
	}
	
	return html;
}
