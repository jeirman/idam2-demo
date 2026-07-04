# Running the lab with docker compose

An alternative to the kind/Tilt setup in `README.md`, for when you want the
same PEP -> PDP -> app call graph without a Kubernetes control plane in the
loop. Same policy, same OPA tests, same fake-JWT scripts -- only the
addressing and dev-loop mechanics change.

## What maps to what

| k8s (kind)                              | docker compose                                  |
|------------------------------------------|--------------------------------------------------|
| 3 containers, 1 pod, shared `127.0.0.1`  | 3 containers, 1 compose network, DNS by service name |
| Service targets only Envoy's port        | Only Envoy's container publishes a host port      |
| Tilt `live_update` syncs source in       | plain bind mount, since compose runs on your own Docker daemon |
| Envoy cluster `type: STATIC` (literal IP)| Envoy cluster `type: STRICT_DNS` (resolves the service name) |

The Rego policy, `opa test` suite, and `make-test-jwt.sh` are all untouched --
none of that layer knows or cares which orchestrator is running it, which is
kind of the point of keeping the PDP a sidecar with its own local API surface.

## Run it

```bash
docker compose up --build
```

- webapp, through its PEP: `http://localhost:8080`
- mcp-server, through its PEP: `http://localhost:8081`
- Postgres, direct (dev convenience, not part of the PEP path): `localhost:5432`

Editing `apps/web` or `apps/mcp-server` on your host reloads instantly --
it's a bind mount, `next dev`'s Fast Refresh sees the change directly, no
sync step involved. If you add a dependency, restart that one service
(`docker compose restart webapp`) or fully recreate it
(`docker compose up --build webapp`) so `pnpm install` reruns in the image
and reseeds the node_modules volume.

## Testing the PEP/PDP path

Identical mechanics to the kind setup, different port for the mcp group:

```bash
curl -i http://localhost:8080/api/public/health                 # -> 200, no token
curl -i http://localhost:8080/api/private                       # -> 403, no token
curl -i http://localhost:8080/api/private \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh admin)" # -> 200

curl -i http://localhost:8081/mcp/tools/read-balance -X POST \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"    # -> 200
curl -i http://localhost:8081/mcp/tools/transfer-funds -X POST \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"    # -> 403
```

Watch decisions live:

```bash
docker compose logs -f opa-webapp
docker compose logs -f opa-mcp
```

Unit-test the policy exactly as before -- this step never touches compose or
kind at all:

```bash
opa test opa/ -v
```

## Where this diverges from the real thing on purpose

- **Network isolation is approximate.** `webapp-internal` has exactly three
  members (envoy-webapp, opa-webapp, webapp), so there's currently nothing
  else on that network to demonstrate a bypass against -- the isolation is
  real but untested by anything adversarial. In GKE you'd back this with
  NetworkPolicies or a service mesh's mTLS-only posture; here it's just
  "don't add other containers to that network."
- **No pod restart semantics, no shared fate.** If `webapp` crashes, Envoy
  and OPA don't restart with it the way sidecars in a pod would. Fine for
  a dev loop, not a substitute for testing failure behavior.
- **SPIFFE/SPIRE (phase 2) isn't ported here yet.** The pattern would be a
  `spire-server` + `spire-agent` service pair with the agent's Workload API
  socket exposed via a shared named volume (instead of a hostPath, since
  there's no DaemonSet concept in compose), bind-mounted into `envoy-mcp`
  and `mcp-server`. Worth doing once you're validating the SVID-issuance
  flow itself, but the PEP/PDP wiring above is unaffected either way.
