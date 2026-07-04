#!/usr/bin/env bash
# Mints an UNSIGNED test JWT (alg: none) for exercising the running PEP/PDP
# stack over curl -- this is lab-only. It decodes fine because the policy
# uses io.jwt.decode, not io.jwt.decode_verify. The moment a real issuer is
# wired in, this script stops producing anything the policy will accept.
#
# Usage:
#   ./scripts/make-test-jwt.sh admin
#   ./scripts/make-test-jwt.sh agent
#   curl -i http://coffer.local/mcp/tools/read-balance \
#     -X POST -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"
set -euo pipefail

role="${1:?usage: make-test-jwt.sh <role>}"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

header=$(printf '{"alg":"none"}' | b64url)
payload=$(printf '{"role":"%s"}' "$role" | b64url)

echo "${header}.${payload}."
