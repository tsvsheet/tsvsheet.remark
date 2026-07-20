/**
 * @tsvsheet/tsvsheet-remark — render fenced ```sheet blocks as computed
 * spreadsheets in JavaScript markdown pipelines.
 *
 * This is item 3's JS-pipeline host: two thin plugins — {@link remarkTsvsheet}
 * (mdast) and {@link markdownItTsvsheet} (markdown-it) — over one shared
 * {@link renderSheet} contract. Neither reimplements the engine: they compute
 * through `@tsvsheet/tsvsheet` (the Go engine embedded as WebAssembly), so a
 * `.tsvt` block renders identically here, in the goldmark host, and in the CLI.
 */
export { renderSheet, renderSheetMarkdown } from "./render.js";
export { resolveOptions, DEFAULT_CLASS, DEFAULT_OUTPUT } from "./options.js";
export { default as remarkTsvsheet } from "./remark.js";
export { default as markdownItTsvsheet } from "./markdown-it.js";
