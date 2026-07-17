/**
 * markdownItTsvsheet — a markdown-it plugin that renders fenced ```sheet blocks
 * as computed HTML tables via the shared {@link renderSheet} contract.
 *
 * markdown-it's render pipeline is synchronous, so — unlike the remark host —
 * this plugin cannot load the engine itself: the caller passes a pre-loaded
 * engine via `options.engine`. The plugin overrides the renderer's `fence`
 * rule, handling `sheet`-language fences and delegating every other language to
 * the previously-registered fence renderer (or markdown-it's default).
 */
import { renderSheet } from "./render.js";

/**
 * @param {object} md the markdown-it instance to extend
 * @param {import("./options.js").Options & { engine: import("@tsvsheet/tsvsheet").Engine }} options
 */
export default function markdownItTsvsheet(md, options = {}) {
	const engine = requireEngine(options.engine);
	const fallback = md.renderer.rules.fence ?? defaultFence;
	md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
		const token = tokens[idx];
		if (firstWord(token.info) !== "sheet") {
			return fallback(tokens, idx, opts, env, self);
		}
		return renderSheet(engine, token.content, options);
	};
}

/** The engine is mandatory here — markdown-it cannot await a lazy load. */
function requireEngine(engine) {
	if (engine === undefined) {
		throw new Error("markdownItTsvsheet requires a loaded engine: pass { engine }");
	}
	return engine;
}

/** markdown-it's stock fence rendering, used when no fence rule was registered. */
function defaultFence(tokens, idx, opts, _env, self) {
	return self.renderToken(tokens, idx, opts);
}

/** The first whitespace-delimited token of a fence info-string. */
function firstWord(info) {
	return info.trim().split(/\s+/)[0];
}
