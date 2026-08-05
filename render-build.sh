#!/bin/bash
# render-build.sh — diagnostic build script
# Runs the full build, captures ALL output, uploads to GitHub Gist for debugging.
# Render's API doesn't expose build logs, so this is how we see what's failing.
set +e  # don't exit on error — we want to capture the full output

LOG_FILE=/tmp/render-build.log

{
  echo "============================================"
  echo "RENDER BUILD DIAGNOSTIC LOG"
  echo "Date: $(date -u)"
  echo "============================================"
  echo ""
  echo "=== ENVIRONMENT ==="
  echo "Node: $(node --version 2>&1)"
  echo "npm: $(npm --version 2>&1)"
  echo "PWD: $(pwd)"
  echo "NODE_OPTIONS: ${NODE_OPTIONS:-not set}"
  echo "NODE_ENV: ${NODE_ENV:-not set}"
  echo "NPM_CONFIG_LEGACY_PEER_DEPS: ${NPM_CONFIG_LEGACY_PEER_DEPS:-not set}"
  echo "DATABASE_URL: ${DATABASE_URL:-not set}"
  echo ""
  echo "=== REPO FILES ==="
  ls -la
  echo ""
  echo "=== package.json scripts ==="
  cat package.json | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin).get('scripts',{}), indent=2))" 2>&1
  echo ""
  echo "=== NPM INSTALL (--legacy-peer-deps) ==="
  npm install --legacy-peer-deps 2>&1
  INSTALL_EXIT=$?
  echo "npm install exit code: $INSTALL_EXIT"
  echo ""

  if [ $INSTALL_EXIT -ne 0 ]; then
    echo "!!! NPM INSTALL FAILED — stopping here !!!"
  else
    echo "=== PRISMA GENERATE ==="
    npx prisma generate 2>&1
    PRISMA_EXIT=$?
    echo "prisma generate exit code: $PRISMA_EXIT"
    echo ""

    echo "=== NEXT BUILD (Turbopack — npm run build) ==="
    npm run build 2>&1
    BUILD_EXIT=$?
    echo "next build exit code: $BUILD_EXIT"
    echo ""
  fi

  echo "============================================"
  echo "BUILD DIAGNOSTIC COMPLETE"
  echo "============================================"
} > "$LOG_FILE" 2>&1

FINAL_EXIT=$?

# Upload log to GitHub Gist (private) so we can read it via API
if [ -n "$GITHUB_TOKEN" ]; then
  echo "Uploading build log to GitHub Gist..." >> "$LOG_FILE"
  CONTENT=$(python3 -c "import json; print(json.dumps(open('$LOG_FILE').read()))" 2>&1)
  GIST_RESPONSE=$(curl -sS -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"description\":\"render-build-log-$(date +%s)\",\"public\":false,\"files\":{\"build.log\":{\"content\":$CONTENT}}}" \
    https://api.github.com/gists 2>&1)
  GIST_URL=$(echo "$GIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('html_url','FAILED'))" 2>&1)
  echo "Gist URL: $GIST_URL" >> "$LOG_FILE"
  echo "GIST_URL=$GIST_URL"
fi

cat "$LOG_FILE"
exit $FINAL_EXIT
