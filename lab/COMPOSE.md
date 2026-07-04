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

## Run it (webapp only)

From `lab/`:

```bash
docker compose up --build
```

This starts **postgres**, the **webapp** pod (`webapp` + `opa-webapp` +
`envoy-webapp`), and nothing from the MCP group.

- webapp, through its PEP: `http://localhost:8080`
- Postgres, direct (dev convenience, not part of the PEP path): `localhost:5432`

The Next.js app lives at `apps/web/idam2-demo-finance/`. The compose file
bind-mounts the repo root and runs `next dev` inside the container, so edits
on the host hot-reload via Fast Refresh. If you add a dependency, recreate
the service so `npm ci` reruns in the image and reseeds the `node_modules`
volume:

```bash
docker compose up --build webapp
```

### Apple Silicon

`openpolicyagent/opa:latest-envoy` is amd64-only. `docker-compose.yml` sets
`platform: linux/amd64` on the OPA services so Docker Desktop emulates them on
arm64 Macs.

## MCP server (not integrated yet)

The MCP **Envoy + OPA sidecars are wired in compose**, but there is no app
under `services/mcp-server/` yet (only a placeholder readme). Those services
use the compose profile `mcp` so a plain `docker compose up` does not try to
build or start them.

To bring up the full MCP pod once the app exists:

1. **Implement the server** under `services/mcp-server/` with at least:
   - `package.json` with a `"dev"` script that listens on `PORT` (default `8000`)
   - application source and a lockfile (`package-lock.json`) if you use npm
2. **Match the dev Dockerfile** at `docker/mcp-server.Dockerfile.dev` -- it
   copies from `services/mcp-server/`, runs `npm install`, and expects
   `npm run dev`.
3. **Start with the profile**:

   ```bash
   docker compose --profile mcp up --build
   ```

   That adds `opa-mcp`, `mcp-server`, and `envoy-mcp` on top of the default
   stack. MCP traffic through its PEP: `http://localhost:8081`.

4. **Live reload**: `mcp-server` bind-mounts `../services/mcp-server` into
   `/app` with a named volume for `node_modules`, same pattern as the webapp.

If you change `docker-compose.yml` paths or the Dockerfile, keep the build
`context` at the **repo root** (`..` from `lab/`) so `services/mcp-server`
is visible to the image build.

## Testing the PEP/PDP path

Webapp (default stack):

```bash
curl -i http://localhost:8080/api/public/health                 # -> 200, no token
curl -i http://localhost:8080/api/private                       # -> 403, no token
curl -i http://localhost:8080/api/private \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh admin)" # -> 200
```

MCP (after `--profile mcp` and a running `services/mcp-server`):

```bash
curl -i http://localhost:8081/mcp/tools/read-balance -X POST \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"    # -> 200
curl -i http://localhost:8081/mcp/tools/transfer-funds -X POST \
  -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"    # -> 403
```

Watch decisions live:

```bash
docker compose logs -f opa-webapp
docker compose --profile mcp logs -f opa-mcp
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
