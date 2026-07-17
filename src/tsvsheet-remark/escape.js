/**
 * escapeHtml — HTML-escape untrusted text for emission into an element body or
 * a double-quoted attribute. The five replacements and their entity forms match
 * Go's `html.EscapeString` exactly (`&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`,
 * `"`→`&#34;`, `'`→`&#39;`), so a cell rendered by this JS host is byte-for-byte
 * identical to the same cell rendered by the goldmark host. Cells and the
 * engine's error text are untrusted; the CSS class is host-controlled but
 * escaped anyway so the output is well-formed for any class string.
 */
const ENTITIES = Object.freeze({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&#34;",
	"'": "&#39;",
});

/** @param {string} text the untrusted text to escape */
export function escapeHtml(text) {
	return text.replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}
