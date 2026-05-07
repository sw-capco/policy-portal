#!/usr/bin/env bash
set -euo pipefail

PRD_ID="${1:-}"
if [[ -z "${PRD_ID}" ]]; then
  echo "Usage: $0 PRD-XXX" >&2
  exit 1
fi

DIR=".genai/context/${PRD_ID}"
mkdir -p "${DIR}"

cat > "${DIR}/instructions.md" <<'EOF'
# AI Development Context

This folder is generated to provide stable, file-based context for an AI coding agent.

- `prd.json`: approved PRD JSON
- `issues.json`: selected GitHub issues (title/body/labels)
- `wireframes.txt`: linked wireframes/mockups summary and export references
EOF

if [[ ! -f "${DIR}/prd.json" ]]; then
  cat > "${DIR}/prd.json" <<'EOF'
{ "title": "", "product_overview": {}, "scope": {} }
EOF
fi

if [[ ! -f "${DIR}/issues.json" ]]; then
  cat > "${DIR}/issues.json" <<'EOF'
[]
EOF
fi

if [[ ! -f "${DIR}/wireframes.txt" ]]; then
  cat > "${DIR}/wireframes.txt" <<'EOF'
Wireframes / mockups export references go here.
EOF
fi

echo "Created/updated ${DIR}"

