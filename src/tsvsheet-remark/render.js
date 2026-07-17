/**
 * renderSheet — the shared fence-dialect contract both markdown hosts emit.
 *
 * Given a loaded engine and the body of a fenced ```sheet block, it computes
 * the grid and returns static HTML: a `<table class="tsvsheet">` of the computed
 * values on success, or a visible `<div class="tsvsheet-error">` when the body
 * is malformed — never silent, never a broken page. A computed error value in a
 * cell (`#DIV/0!`, `#REF!`) is data and renders as its cell text. The output is
 * byte-for-byte equivalent to the goldmark host for the same source, so a
 * document renders identically whichever host processes it.
 */
import { escapeHtml } from "./escape.js";
import { resolveOptions } from "./options.js";

/**
 * @param {import("@tsvsheet/tsvsheet").Engine} engine a loaded engine
 * @param {string} source the `.tsvt` body of a ```sheet block
 * @param {import("./options.js").Options} [options]
 * @returns {string} the computed table HTML, or an inline error `<div>`
 */
export function renderSheet(engine, source, options) {
	const opts = resolveOptions(options);
	try {
		return tableHtml(engine.compute(source).computed, source, opts);
	} catch (err) {
		return errorHtml(err);
	}
}

/** Render a parse failure as a visible, escaped error pane. */
function errorHtml(err) {
	return `<div class="tsvsheet-error">${escapeHtml(err.message)}</div>`;
}

/** Render a computed grid as a `<table>` plus the optional source pane. */
function tableHtml(grid, source, opts) {
	const rows = grid.map(rowHtml).join("");
	const table = `<table class="${escapeHtml(opts.className)}">${rows}</table>`;
	return table + sourceHtml(source, opts);
}

/** Render one grid row as a `<tr>` of HTML-escaped `<td>` cells. */
function rowHtml(row) {
	return `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
}

/** Append the raw `.tsvt` source in a collapsible pane when showSource is set. */
function sourceHtml(source, opts) {
	if (!opts.showSource) {
		return "";
	}
	return `<details class="tsvsheet-source"><summary>source</summary><pre>${escapeHtml(source)}</pre></details>`;
}
