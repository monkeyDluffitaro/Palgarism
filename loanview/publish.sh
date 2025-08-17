#!/usr/bin/env bash
set -euo pipefail

# Usage: GH_TOKEN=... [GH_USER=your-username] ./publish.sh [repo-name]
# Requires: curl, git. Token must have repo scope.

REPO_NAME=${1:-loanview}
PRIVATE_JSON=true

if [[ -z "${GH_TOKEN:-}" ]]; then
	echo "Error: Set GH_TOKEN environment variable (with repo scope)." >&2
	exit 1
fi

if [[ -z "${GH_USER:-}" ]]; then
	GH_USER=$(curl -s -H "Authorization: token ${GH_TOKEN}" https://api.github.com/user | sed -n 's/.*"login": *"\([^"]*\)".*/\1/p')
	if [[ -z "${GH_USER}" ]]; then
		echo "Error: Could not determine GH_USER from token. Set GH_USER manually." >&2
		exit 1
	fi
fi

cd "$(dirname "$0")"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init -q

git add .
if ! git diff --cached --quiet; then
	git commit -m "chore: publish ${REPO_NAME} initial" -q || true
fi

git branch -M main || true

# Create repo (idempotent)
curl -s -H "Authorization: token ${GH_TOKEN}" -H "Accept: application/vnd.github+json" \
	-d "{\"name\":\"${REPO_NAME}\",\"private\":${PRIVATE_JSON}}" \
	https://api.github.com/user/repos >/dev/null || true

# Push
if git remote get-url origin >/dev/null 2>&1; then
	git remote remove origin
fi
git remote add origin "https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${REPO_NAME}.git"

echo "Pushing to https://github.com/${GH_USER}/${REPO_NAME} ..."

git push -u origin main

echo "Done. Consider removing the token from the remote URL:"
echo "  git remote set-url origin https://github.com/${GH_USER}/${REPO_NAME}.git"