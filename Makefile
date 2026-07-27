.DEFAULT_GOAL := help

# The JavaScript package's quality gate: eslint (complexity <= 7), the node
# test runner at 100% line coverage of the source (src/tsvsheet-remark), and a
# dependency audit. The engine is NOT reimplemented here: fenced ```sheet blocks
# are computed through @tsvsheet/tsvsheet (the Go engine embedded as
# WebAssembly), the shared source of truth for every host.

.PHONY: help check ci lint test audit

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  %-8s %s\n", $$1, $$2}'

check: lint test format-check audit ## Full quality gate

ci: check ## Full gate as run by CI

lint: ## eslint on the source and tests
	npm run --silent lint

test: ## node --test with 100% line coverage of src/tsvsheet-remark
	npm test

# The engine is consumed as a sibling checkout (file:../tsvsheet.js), and
# Dependabot cannot resolve a path dependency — its npm updates abort with
# path_dependencies_not_reachable, so no security PR is ever opened against this
# repo. Auditing in the gate is what replaces those PRs: a vulnerable tree fails
# the build here and in CI instead of going unnoticed.
audit: ## npm audit — the gate that replaces Dependabot's unopenable PRs
	npm audit

# CI runs biome over this repo through the shared TypeScript image, using its own
# file-selection rules (generated markers, minified bundles and coverage/ are
# excluded). Running the SAME image here is what makes a local pass mean a remote
# pass: a hand-rolled biome call would drift from the pinned one, and a gate that
# disagrees with CI is a gate people stop trusting.
# The tag floats on purpose and is not digest-pinned: the workflow references
# the same `@v2`, so pinning a digest here would put the local gate on a
# different binary than CI — the very drift this target exists to remove. It is
# the org's own registry, already trusted by every workflow in the fleet, and
# `?=` lets a caller pin a digest for a one-off audited run.
TS_CI_IMAGE ?= ghcr.io/nicerobot/tools.build/ci/typescript:v2

.PHONY: format-check
format-check: ## biome, via the same pinned image CI runs
	docker run --rm -v "$(CURDIR)":/github/workspace -w /github/workspace $(TS_CI_IMAGE)
