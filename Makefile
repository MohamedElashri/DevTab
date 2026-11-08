# DevTab — Makefile
# Build and package Firefox and Chrome extensions for manual store uploads.

.PHONY: all install ci update update-dev dev test lint typecheck test-background \
	build build-firefox build-chrome package package-firefox package-chrome source \
	bump bump-minor bump-major _bump release clean help

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DIST_DIR       := dist
FIREFOX_ZIP    := firefox_extension.zip
CHROME_ZIP     := chrome_extension.zip
SOURCE_ZIP     := source_code.zip
NPM            := npm
NPX            := npx
DEV_DEPS       := $(shell node -p "Object.keys(require('./package.json').devDependencies || {}).join(' ')")

# ---------------------------------------------------------------------------
# Default target
# ---------------------------------------------------------------------------
all:
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) test
	$(MAKE) package
	@echo ""
	@echo "✅  All done. Extensions ready: $(FIREFOX_ZIP) and $(CHROME_ZIP)"

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
help:
	@echo "DevTab — Makefile targets"
	@echo ""
	@echo "  make install      Install dependencies (npm ci)"
	@echo "  make update       Update dependencies within their ranges (npm update)"
	@echo "  make update-dev   Update only dev dependencies within their ranges"
	@echo "  make dev          Start the Vite dev server"
	@echo "  make test         Run lint, typecheck, and background messaging tests"
	@echo "  make lint         Run ESLint"
	@echo "  make typecheck    Run TypeScript type checker (no emit)"
	@echo "  make build        Build both browsers into dist/firefox and dist/chrome"
	@echo "  make build-firefox Build only Firefox"
	@echo "  make build-chrome  Build only Chrome"
	@echo "  make package      Build and ZIP both browsers for manual upload"
	@echo "  make package-firefox Create $(FIREFOX_ZIP)"
	@echo "  make package-chrome  Create $(CHROME_ZIP)"
	@echo "  make source       Create $(SOURCE_ZIP) for the AMO review"
	@echo "  make bump         Bump the patch version (x.y.Z)"
	@echo "  make bump-minor   Bump the minor version (x.Y.0)"
	@echo "  make bump-major   Bump the major version (X.0.0)"
	@echo "  make release      Bump version, test, build, and package"
	@echo "  make clean        Remove $(DIST_DIR), *.zip, and build artifacts"
	@echo "  make all          Run: clean → install → test → build → package"
	@echo ""
	@echo "Version bump example:"
	@echo "  VERSION=1.2.0 make release"

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
install:
	@echo "📦  Installing dependencies..."
	$(NPM) ci

update:
	@echo "🚀  Checking for dependency updates within ranges..."
	$(NPM) update
	@echo "✅  Dependencies updated."

update-dev:
	@echo "🚀  Checking for dev dependency updates within ranges..."
	$(NPM) update $(DEV_DEPS)
	@echo "✅  Dev dependencies updated."

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------
dev:
	@echo "🚀  Starting dev server..."
	$(NPX) vite

# ---------------------------------------------------------------------------
# Testing / Quality
# ---------------------------------------------------------------------------
test: lint typecheck test-background
	@echo "✅  All checks passed."

lint:
	@echo "🔍  Running ESLint..."
	$(NPM) run lint

typecheck:
	@echo "🔍  Running TypeScript type check..."
	$(NPM) run typecheck

test-background:
	$(NPM) test

# ---------------------------------------------------------------------------
# Building
# ---------------------------------------------------------------------------
build: build-firefox build-chrome

build-firefox:
	$(NPM) run build:firefox

build-chrome:
	$(NPM) run build:chrome

# ---------------------------------------------------------------------------
# Packaging
# ---------------------------------------------------------------------------
package: package-firefox package-chrome

package-firefox:
	$(NPM) run package:firefox

package-chrome:
	$(NPM) run package:chrome

# ---------------------------------------------------------------------------
# Source code zip (for Mozilla add-on review)
# ---------------------------------------------------------------------------
source:
	@echo "📦  Creating source code archive..."
	rm -f $(SOURCE_ZIP)
	zip -qr $(SOURCE_ZIP) \
		public/ script/ src/ LICENSE \
		package.json package-lock.json \
		index.html README.md CHANGELOG.md vite.config.mjs \
		tsconfig.json tsconfig.node.json \
		Makefile .npmrc .nvmrc eslint.config.mjs \
		-x "*.DS_Store" -x "*/node_modules/*"
	@echo "✅  Source archive: $(SOURCE_ZIP)"

# ---------------------------------------------------------------------------
# Versioning
# ---------------------------------------------------------------------------
bump:
	@$(MAKE) _bump BUMP_TYPE=patch

bump-minor:
	@$(MAKE) _bump BUMP_TYPE=minor

bump-major:
	@$(MAKE) _bump BUMP_TYPE=major

_bump:
	@echo "🏷️   Bumping $(BUMP_TYPE) version..."
	$(NPM) version $(BUMP_TYPE) --no-git-tag-version
	@VERSION=$$(node -p "require('./package.json').version"); \
		echo "✅  Version bumped to $$VERSION (package.json is the single source of truth)."

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌  VERSION is not set. Example: VERSION=1.2.0 make release"; \
		exit 1; \
	fi
	@echo "🏷️   Bumping version to $(VERSION)..."
	$(NPM) version $(VERSION) --no-git-tag-version --allow-same-version
	@echo "🧹  Cleaning and reinstalling..."
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) test
	$(MAKE) package
	$(MAKE) source
	@echo ""
	@echo "✅  Release $(VERSION) ready: $(FIREFOX_ZIP), $(CHROME_ZIP), and $(SOURCE_ZIP)"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
clean:
	@echo "🧹  Cleaning build artifacts..."
	rm -rf $(DIST_DIR)
	rm -f $(FIREFOX_ZIP) $(CHROME_ZIP) $(SOURCE_ZIP)
	@echo "✅  Clean complete."
