/**
 * The rendering options shared by both markdown hosts (remark and markdown-it),
 * so a `.tsvt` block renders identically through either pipeline and matches the
 * goldmark host's contract: a `<table class="tsvsheet">` by default, with the
 * raw source optionally appended in a collapsible pane.
 */

/** The default CSS class placed on the rendered `<table>`, matching goldmark. */
export const DEFAULT_CLASS = "tsvsheet";

/**
 * @typedef {object} Options
 * @property {string} [className] CSS class for the `<table>` (default "tsvsheet")
 * @property {boolean} [showSource] append the raw `.tsvt` source in a `<details>` pane (default false)
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
	};
}
