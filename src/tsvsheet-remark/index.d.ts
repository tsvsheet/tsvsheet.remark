/**
 * TypeScript declarations for @tsvsheet/tsvsheet-remark — the remark and
 * markdown-it plugins that render fenced ```sheet blocks as computed HTML, or
 * (with the remark host) bake them into portable markdown tables.
 */
import type { Engine } from "@tsvsheet/tsvsheet";

/** Rendering options shared by both hosts. */
export interface Options {
	/** CSS class placed on the rendered `<table>` (default "tsvsheet"). */
	className?: string;
	/** Append the raw `.tsvt` source in a collapsible `<details>` pane (default false). */
	showSource?: boolean;
	/**
	 * Serialization for the remark host: an HTML `<table>` (default) or a portable
	 * GFM markdown table. The `markdown` mode is remark-only; markdown-it, an
	 * HTML-only host, ignores it.
	 */
	output?: "html" | "markdown";
	/** A pre-loaded engine; the remark host loads one lazily when omitted. */
	engine?: Engine;
}

/** The default `<table>` CSS class ("tsvsheet"), matching the goldmark host. */
export const DEFAULT_CLASS: "tsvsheet";

/** The default output serialization ("html"). */
export const DEFAULT_OUTPUT: "html";

/** Resolve caller options over the defaults into a concrete settings object. */
export function resolveOptions(options?: Options): {
	className: string;
	showSource: boolean;
	output: "html" | "markdown";
};

/**
 * Compute a ```sheet block body and return its HTML: a `<table class="…">` on
 * success, or a `<div class="tsvsheet-error">` when the body is malformed.
 */
export function renderSheet(engine: Engine, source: string, options?: Options): string;

/**
 * Compute a ```sheet block body and return a GitHub-flavored markdown pipe
 * table — byte-for-byte the CLI's `tsv render --format md` — or the same
 * `<div class="tsvsheet-error">` as {@link renderSheet} when the body is
 * malformed.
 */
export function renderSheetMarkdown(engine: Engine, source: string): string;

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
