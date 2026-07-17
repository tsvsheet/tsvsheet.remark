.DEFAULT_GOAL := help

# The JavaScript package's quality gate: eslint (complexity <= 7) and the node
# test runner at 100% line coverage of the source (src/tsvsheet-remark). The
# engine is NOT reimplemented here: fenced ```sheet blocks are computed through
# @tsvsheet/tsvsheet (the Go engine embedded as WebAssembly), the shared source of
# truth for every host.

.PHONY: help check ci lint test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  %-8s %s\n", $$1, $$2}'

check: lint test ## Full quality gate

ci: check ## Full gate as run by CI

lint: ## eslint on the source and tests
	npm run --silent lint

test: ## node --test with 100% line coverage of src/tsvsheet-remark
	npm test
