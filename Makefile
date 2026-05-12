# DevTab — Makefile
# Targets for testing, building, and releasing the Firefox extension.

.PHONY: all install dev typecheck build package release clean help

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MANIFEST       := public/manifest.json
DIST_DIR       := dist
RELEASE_ZIP    := firefox_extension.zip
SOURCE_ZIP     := source_code.zip
NPM            := npm
NPX            := npx

# ---------------------------------------------------------------------------
# Default target
# ---------------------------------------------------------------------------
all: clean install typecheck build package
	@echo ""
	@echo "✅  All done. Extension ready at: $(RELEASE_ZIP)"

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
help:
	@echo "DevTab — Makefile targets"
	@echo ""
	@echo "  make install        Install dependencies"
	@echo "  make dev            Start the Vite dev server"
	@echo "  make typecheck      Run TypeScript type checker (no emit)"
	@echo "  make build          Build the extension for production"
	@echo "  make package        Create $(RELEASE_ZIP) from $(DIST_DIR)"
	@echo "  make release        Bump version, build, and package"
	@echo "  make clean          Remove $(DIST_DIR), *.zip, and build artifacts"
	@echo "  make all            Run: clean → install → typecheck → build → package"
	@echo ""
	@echo "Version bump example:"
	@echo "  VERSION=1.2.0 make release"

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
install:
	@echo "📦  Installing dependencies..."
	$(NPM) install --legacy-peer-deps

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------
dev:
	@echo "🚀  Starting dev server..."
	$(NPX) vite

# ---------------------------------------------------------------------------
# Testing / Quality
# ---------------------------------------------------------------------------
typecheck:
	@echo "🔍  Running TypeScript type check..."
	$(NPX) tsc --noEmit

# ---------------------------------------------------------------------------
# Building
# ---------------------------------------------------------------------------
build:
	@echo "🔨  Building extension for production..."
	VITE_BUILD_TARGET=extension $(NPX) vite build

# ---------------------------------------------------------------------------
# Packaging
# ---------------------------------------------------------------------------
package: build
	@echo "📦  Packaging Firefox extension..."
	rm -f $(RELEASE_ZIP)
	cd $(DIST_DIR) && zip -r ../$(RELEASE_ZIP) * \
		-x "*.DS_Store" \
		-x "web_manifest.json" \
		-x "screenshots/*" \
		-x "images/*" \
		-x "robots.txt"
	@echo ""
	@echo "✅  Packaged: $(RELEASE_ZIP)"

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌  VERSION is not set. Example: VERSION=1.2.0 make release"; \
		exit 1; \
	fi
	@echo "🏷️   Bumping version to $(VERSION)..."
	node -e "const fs=require('fs'); const p='$(MANIFEST)'; const j=JSON.parse(fs.readFileSync(p)); j.version='$(VERSION)'; fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n')"
	node -e "const fs=require('fs'); const p='package.json'; const j=JSON.parse(fs.readFileSync(p)); j.version='$(VERSION)'; fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n')"
	@echo "🔨  Building and packaging..."
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) typecheck
	$(MAKE) build
	$(MAKE) package
	$(MAKE) source
	@echo ""
	@echo "✅  Release $(VERSION) ready: $(RELEASE_ZIP) and $(SOURCE_ZIP)"

# ---------------------------------------------------------------------------
# Source code zip (for Mozilla add-on review)
# ---------------------------------------------------------------------------
source:
	@echo "📦  Creating source code archive..."
	rm -f $(SOURCE_ZIP)
	zip -r $(SOURCE_ZIP) \
		public/ script/ src/ LICENSE \
		package.json package-lock.json \
		README.md vite.config.mjs \
		tsconfig.json tsconfig.node.json \
		Makefile \
		-x "*.DS_Store" -x "*/node_modules/*"
	@echo "✅  Source archive: $(SOURCE_ZIP)"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------
clean:
	@echo "🧹  Cleaning build artifacts..."
	rm -rf $(DIST_DIR)
	rm -f $(RELEASE_ZIP) $(SOURCE_ZIP)
	@echo "✅  Clean complete."
