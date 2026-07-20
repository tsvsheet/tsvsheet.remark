/**
 * The rendering options shared by both markdown hosts (remark and markdown-it),
 * so a `.tsvt` block renders identically through either pipeline and matches the
 * goldmark host's contract: a `<table class="tsvsheet">` by default, with the
 * raw source optionally appended in a collapsible pane.
 */

/** The default CSS class placed on the rendered `<table>`, matching goldmark. */
export const DEFAULT_CLASS = "tsvsheet";

/**
 * The default output serialization: an HTML `<table>`. The `markdown` mode is a
 * remark-only capability (markdown-it, like goldmark, is an HTML-only host and
 * ignores it) that bakes a computed sheet into a portable GFM pipe table.
 */
export const DEFAULT_OUTPUT = "html";

/**
 * @typedef {object} Options
 * @property {string} [className] CSS class for the `<table>` (default "tsvsheet")
 * @property {boolean} [showSource] append the raw `.tsvt` source in a `<details>` pane (default false)
 * @property {"html"|"markdown"} [output] serialization for the remark host: an HTML `<table>` (default) or a GFM markdown table
 * @property {import("@tsvsheet/tsvsheet").Engine} [engine] a pre-loaded engine
 */

/**
 * Fold caller options over the defaults into a resolved, plain settings object.
 * @param {Options} [options]
 */
export function resolveOptions(options = {}) {
	return {
		className: options.className ?? DEFAULT_CLASS,
		showSource: options.showSource ?? false,
		output: options.output ?? DEFAULT_OUTPUT,
	};
}
