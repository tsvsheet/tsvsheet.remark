/**
 * markdownItTsvsheet — the markdown-it host. The plugin only touches
 * `md.renderer.rules.fence`, so it is exercised over a fake `md` with that
 * shape: a `sheet` fence is computed, any other language delegates to the
 * previously-registered rule (or markdown-it's default via `renderToken`), and
 * a missing engine is rejected at registration.
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import { load } from "@tsvsheet/tsvsheet";

import markdownItTsvsheet from "../src/tsvsheet-remark/markdown-it.js";

/** A fake markdown-it whose fence rule starts as `initial`. */
const fakeMd = (initial) => ({ renderer: { rules: { fence: initial } } });

/** A single-token render call against the installed fence rule. */
const renderFence = (md, token, self) =>
	md.renderer.rules.fence([token], 0, {}, {}, self);

describe("markdownItTsvsheet", () => {
	let engine;
	before(async () => {
		engine = await load();
	});

	it("renders a sheet fence as a computed table", () => {
		const md = fakeMd(undefined);
		markdownItTsvsheet(md, { engine });
		const html = renderFence(md, { info: "sheet", content: "1\t2\n=A1+B1\t\n" });
		assert.equal(
			html,
			'<table class="tsvsheet"><tr><td>1</td><td>2</td></tr><tr><td>3</td><td></td></tr></table>',
		);
	});

	it("trims and matches only the first info-string word", () => {
		const md = fakeMd(undefined);
		markdownItTsvsheet(md, { engine });
		const html = renderFence(md, { info: "  sheet static ", content: "=9\n" }, {});
		assert.match(html, /<td>9<\/td>/);
	});

	it("delegates a non-sheet fence to the previously-registered rule", () => {
		const md = fakeMd(() => "FALLBACK");
		markdownItTsvsheet(md, { engine });
		assert.equal(renderFence(md, { info: "js", content: "x" }, {}), "FALLBACK");
	});

	it("delegates to markdown-it's default renderToken when no rule was set", () => {
		const md = fakeMd(undefined);
		markdownItTsvsheet(md, { engine });
		const self = { renderToken: () => "DEFAULT" };
		assert.equal(renderFence(md, { info: "js", content: "x" }, self), "DEFAULT");
	});

	it("throws when no engine is provided", () => {
		assert.throws(() => markdownItTsvsheet(fakeMd(undefined)), /requires a loaded engine/);
	});
});
