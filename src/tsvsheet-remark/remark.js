/**
 * remarkTsvsheet — a remark (mdast) plugin that replaces every fenced ```sheet
 * code block with its computed HTML table, produced by the shared
 * {@link renderSheet} contract over the embedded tsvsheet engine.
 *
 * remark transformers may be async, so the plugin loads the engine once per run
 * (lazily, unless the caller injects a pre-loaded one via `options.engine`) and
 * then walks the tree synchronously, swapping each `code` node whose language is
 * `sheet` for a raw `html` node. Every other node — including code blocks in
 * other languages — is left untouched.
 */
import { load } from "@tsvsheet/tsvsheet";

import { resolveOptions } from "./options.js";
import { renderSheet, renderSheetMarkdown } from "./render.js";

/**
 * @param {import("./options.js").Options} [options]
 * @returns {(tree: object) => Promise<void>} a remark transformer
 */
export default function remarkTsvsheet(options = {}) {
	return async function transformer(tree) {
		const engine = options.engine ?? (await load());
		replaceSheets(tree, sheetRenderer(engine, options));
	};
}

/**
 * Select the serializer for the configured output: an HTML `<table>` by default,
 * or a portable GFM markdown table when `output` is `markdown`. Either way the
 * result is emitted as a raw `html` node, which remark-stringify passes through
 * verbatim.
 */
function sheetRenderer(engine, options) {
	if (resolveOptions(options).output === "markdown") {
		return (source) => renderSheetMarkdown(engine, source);
	}
	return (source) => renderSheet(engine, source, options);
}

/** Replace `sheet` code children with computed `html` nodes, recursing the rest. */
function replaceSheets(node, render) {
	if (node.children === undefined) {
		return;
	}
	node.children.forEach((child, index) => {
		if (isSheet(child)) {
			node.children[index] = { type: "html", value: render(child.value) };
			return;
		}
		replaceSheets(child, render);
	});
}

/** A `code` node fenced as ```sheet. */
function isSheet(node) {
	return node.type === "code" && node.lang === "sheet";
}
