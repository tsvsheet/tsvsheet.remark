.DEFAULT_GOAL := help

# The JavaScript package's quality gate: eslint (complexity <= 7) and the node
# test runner at 100% line coverage of the source (src/tsvsheet-remark). The
# engine is NOT reimplemented here: fenced ```sheet blocks are computed through
# @tsvsheet/tsvsheet (the Go engine embedded as WebAssembly), the shared source of
# truth for every host.

.PHONY: help check ci lint test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  %-8s %s\n", $$1, $$2}'

check: lint test format-check ## Full quality gate

ci: check ## Full gate as run by CI

lint: ## eslint on the source and tests
	npm run --silent lint

test: ## node --test with 100% line coverage of src/tsvsheet-remark
	npm test

# CI runs biome over this repo through the shared TypeScript image, using its own
# file-selection rules (generated markers, minified bundles and coverage/ are
# excluded). Running the SAME image here is what makes a local pass mean a remote
# pass: a hand-rolled biome call would drift from the pinned one, and a gate that
# disagrees with CI is a gate people stop trusting.
TS_CI_IMAGE ?= ghcr.io/nicerobot/tools.build/ci/typescript:v2

.PHONY: format-check
format-check: ## biome, via the same pinned image CI runs
	docker run --rm -v "$(CURDIR)":/github/workspace -w /github/workspace $(TS_CI_IMAGE)
