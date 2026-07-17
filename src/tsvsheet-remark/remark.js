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

import { renderSheet } from "./render.js";

/**
 * @param {import("./options.js").Options} [options]
 * @returns {(tree: object) => Promise<void>} a remark transformer
 */
export default function remarkTsvsheet(options = {}) {
	return async function transformer(tree) {
		const engine = options.engine ?? (await load());
		replaceSheets(tree, engine, options);
	};
}

/** Replace `sheet` code children with computed `html` nodes, recursing the rest. */
function replaceSheets(node, engine, options) {
	if (node.children === undefined) {
		return;
	}
	node.children.forEach((child, index) => {
		if (isSheet(child)) {
			node.children[index] = { type: "html", value: renderSheet(engine, child.value, options) };
			return;
		}
		replaceSheets(child, engine, options);
	});
}

/** A `code` node fenced as ```sheet. */
function isSheet(node) {
	return node.type === "code" && node.lang === "sheet";
}
