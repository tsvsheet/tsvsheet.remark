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

/**
 * renderSheetMarkdown — the markdown-baking sibling of {@link renderSheet}.
 *
 * Given a loaded engine and the body of a fenced ```sheet block, it computes
 * the grid and returns a GitHub-flavored pipe table — byte-for-byte the CLI's
 * `tsv render --format md` output — so a computed sheet freezes into portable
 * markdown that renders anywhere with no engine. A malformed body yields the
 * same visible `<div class="tsvsheet-error">` the HTML host emits (valid raw
 * HTML in GFM), so one error representation holds across every output mode.
 *
 * @param {import("@tsvsheet/tsvsheet").Engine} engine a loaded engine
 * @param {string} source the `.tsvt` body of a ```sheet block
 * @returns {string} the computed GFM pipe table, or an inline error `<div>`
 */
export function renderSheetMarkdown(engine, source) {
	try {
		return markdownTable(engine.compute(source).computed);
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

/**
 * Render a computed grid as a GitHub-flavored pipe table: the first row is the
 * header, followed by a `---` separator row, then the remaining rows. An empty
 * grid yields no output, matching the CLI's markdown format.
 */
function markdownTable(grid) {
	if (grid.length === 0) {
		return "";
	}
	const [header, ...body] = grid;
	const separator = header.map(() => "---");
	return [header, separator, ...body].map(markdownRow).join("");
}

/** Render one grid row as a pipe-delimited table row of escaped cells. */
function markdownRow(row) {
	return `| ${row.map(escapeCell).join(" | ")} |\n`;
}

/**
 * Escape a cell for pipe-table safety, matching the CLI's `markdownRow`: a `|`
 * is backslash-escaped so it never starts a new column, and a newline — which a
 * cell can hold via CHAR(10) — becomes a `<br>` so it never splits the row.
 */
function escapeCell(cell) {
	return cell
		.replaceAll("|", "\\|")
		.replaceAll("\r\n", "<br>")
		.replaceAll("\n", "<br>")
		.replaceAll("\r", "<br>");
}
