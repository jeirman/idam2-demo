#!/usr/bin/env bash
# Run once SPIRE server + agent are up and the mcp-server Deployment has its
# own ServiceAccount (see the PHASE 2 comment in ../k8s/05-mcp-server.yaml).
# This tells SPIRE: "any pod running as sa:mcp-server in ns:coffer on this
# cluster is entitled to the spiffe://coffer.internal/mcp-server identity."
set -euo pipefail

kubectl exec -n spire spire-server-0 -- \
  /opt/spire/bin/spire-server entry create \
    -spiffeID spiffe://coffer.internal/mcp-server \
    -parentID spiffe://coffer.internal/spire/agent/k8s_psat/coffer-lab \
    -selector k8s:ns:coffer \
    -selector k8s:sa:mcp-server

echo "Verify with:"
echo "  kubectl exec -n spire spire-server-0 -- /opt/spire/bin/spire-server entry show"
