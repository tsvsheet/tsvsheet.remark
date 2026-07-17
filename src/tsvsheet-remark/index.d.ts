/**
 * TypeScript declarations for @tsvsheet/tsvsheet-remark — the remark and
 * markdown-it plugins that render fenced ```sheet blocks as computed HTML.
 */
import type { Engine } from "@tsvsheet/tsvsheet";

/** Rendering options shared by both hosts. */
export interface Options {
	/** CSS class placed on the rendered `<table>` (default "tsvsheet"). */
	className?: string;
	/** Append the raw `.tsvt` source in a collapsible `<details>` pane (default false). */
	showSource?: boolean;
	/** A pre-loaded engine; the remark host loads one lazily when omitted. */
	engine?: Engine;
}

/** The default `<table>` CSS class ("tsvsheet"), matching the goldmark host. */
export const DEFAULT_CLASS: "tsvsheet";

/** Resolve caller options over the defaults into a concrete settings object. */
export function resolveOptions(options?: Options): {
	className: string;
	showSource: boolean;
};

/**
 * Compute a ```sheet block body and return its HTML: a `<table class="…">` on
 * success, or a `<div class="tsvsheet-error">` when the body is malformed.
 */
export function renderSheet(engine: Engine, source: string, options?: Options): string;

/** A remark (mdast) transformer factory. Loads the engine lazily if not injected. */
export function remarkTsvsheet(options?: Options): (tree: unknown) => Promise<void>;

/**
 * A markdown-it plugin. The engine is mandatory — markdown-it renders
 * synchronously and cannot await a lazy load.
 */
export function markdownItTsvsheet(
	md: unknown,
	options: Options & { engine: Engine },
): void;
