/**
 * remarkTsvsheet — the mdast host. The transformer is exercised over hand-built
 * mdast trees (the stable contract it operates on): `sheet` code nodes become
 * `html` nodes, every other node is left untouched, and nesting is walked.
 * Both engine-injection paths are covered — a pre-loaded engine and the lazy
 * `load()` fallback.
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import { load } from "@tsvsheet/tsvsheet";

import remarkTsvsheet from "../src/tsvsheet-remark/remark.js";

/** A minimal mdast document wrapping the given block-level children. */
const doc = (...children) => ({ type: "root", children });

/** A fenced code node. */
const code = (lang, value) => ({ type: "code", lang, value });

describe("remarkTsvsheet", () => {
	let engine;
	before(async () => {
		engine = await load();
	});

	it("replaces a sheet code node with its computed html node", async () => {
		const tree = doc(code("sheet", "1\t2\n=A1+B1\t\n"));
		await remarkTsvsheet({ engine })(tree);
		assert.equal(tree.children[0].type, "html");
		assert.equal(
			tree.children[0].value,
			'<table class="tsvsheet"><tr><td>1</td><td>2</td></tr><tr><td>3</td><td></td></tr></table>',
		);
	});

	it("leaves non-sheet code and other nodes untouched", async () => {
		const js = code("js", "const x = 1;");
		const text = { type: "paragraph", children: [{ type: "text", value: "hi" }] };
		const tree = doc(js, text);
		await remarkTsvsheet({ engine })(tree);
		assert.equal(tree.children[0], js);
		assert.equal(tree.children[1], text);
	});

	it("recurses into nested containers", async () => {
		const tree = doc({ type: "blockquote", children: [code("sheet", "=2*3\n")] });
		await remarkTsvsheet({ engine })(tree);
		assert.equal(tree.children[0].children[0].type, "html");
		assert.match(tree.children[0].children[0].value, /<td>6<\/td>/);
	});

	it("loads the engine lazily when none is injected", async () => {
		const tree = doc(code("sheet", "=7\n"));
		await remarkTsvsheet()(tree);
		assert.match(tree.children[0].value, /<td>7<\/td>/);
	});

	it("passes rendering options through to the shared contract", async () => {
		const tree = doc(code("sheet", "1\n"));
		await remarkTsvsheet({ engine, className: "grid" })(tree);
		assert.match(tree.children[0].value, /^<table class="grid">/);
	});

	it("bakes a sheet into a portable markdown table when output is markdown", async () => {
		const tree = doc(code("sheet", "Item\tPrice\nApple\t=1+1\n"));
		await remarkTsvsheet({ engine, output: "markdown" })(tree);
		assert.equal(tree.children[0].type, "html");
		assert.equal(
			tree.children[0].value,
			"| Item | Price |\n| --- | --- |\n| Apple | 2 |\n",
		);
	});
});
