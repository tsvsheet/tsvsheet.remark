import js from "@eslint/js";

export default [
	js.configs.recommended,
	{
		files: ["src/tsvsheet-remark/**/*.js", "tests/**/*.js"],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: "module",
			globals: {
				process: "readonly",
				URL: "readonly",
				console: "readonly",
			},
		},
		rules: {
			complexity: ["error", 7],
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		},
	},
];
