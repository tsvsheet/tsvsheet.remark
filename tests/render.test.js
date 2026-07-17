/**
 * renderSheet — the shared fence-dialect contract. These tests compute through
 * the real embedded engine (the same tsvsheet.wasm every host uses), so the
 * asserted HTML is the genuine cross-host output, not a stub's.
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import { load } from "@tsvsheet/tsvsheet";

import { DEFAULT_CLASS, renderSheet, resolveOptions } from "../src/tsvsheet-remark/index.js";

describe("renderSheet", () => {
	let engine;
	before(async () => {
		engine = await load();
	});

	it("computes a grid into a <table> of the default class", () => {
		const html = renderSheet(engine, "1\t2\n=A1+B1\t=A1*B1\n");
		assert.equal(
			html,
			'<table class="tsvsheet"><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>2</td></tr></table>',
		);
	});

	it("renders a computed error value as its cell text, not a Go error", () => {
		const html = renderSheet(engine, "=1/0\t=A1+1\n");
		assert.equal(
			html,
			'<table class="tsvsheet"><tr><td>#DIV/0!</td><td>#DIV/0!</td></tr></table>',
		);
	});

	it("renders a malformed block as a visible, escaped error <div>", () => {
		const html = renderSheet(engine, "=1 +\n");
		assert.match(html, /^<div class="tsvsheet-error">.+<\/div>$/);
		assert.doesNotMatch(html, /<table/);
	});

	it("HTML-escapes untrusted cell text like the goldmark host", () => {
		const html = renderSheet(engine, `<b>&"'\n`);
		assert.match(html, /<td>&lt;b&gt;&amp;&#34;&#39;<\/td>/);
	});

	it("honors a custom table class, escaping it", () => {
		const html = renderSheet(engine, "1\n", { className: 'a"b' });
		assert.match(html, /^<table class="a&#34;b">/);
	});

	it("appends the raw source in a <details> pane when showSource is set", () => {
		const html = renderSheet(engine, "=1/0\n", { showSource: true });
		assert.match(
			html,
			/<\/table><details class="tsvsheet-source"><summary>source<\/summary><pre>=1\/0\n<\/pre><\/details>$/,
		);
	});

	it("omits the source pane by default", () => {
		const html = renderSheet(engine, "1\n");
		assert.doesNotMatch(html, /<details/);
	});
});

describe("resolveOptions", () => {
	it("defaults the class to tsvsheet and hides the source", () => {
		assert.deepEqual(resolveOptions(), { className: DEFAULT_CLASS, showSource: false });
	});

	it("takes caller overrides", () => {
		assert.deepEqual(resolveOptions({ className: "x", showSource: true }), {
			className: "x",
			showSource: true,
		});
	});
});
