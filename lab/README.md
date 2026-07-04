# Coffer lab environment

Local Kubernetes lab for testing the Coffer PEP/PDP architecture: Envoy as
policy enforcement point, OPA as policy decision point, sidecar-per-workload,
in front of both the webapp and the MCP server.

> Want the same call graph without kind/Tilt in the loop? See `COMPOSE.md` --
> same policy, same tests, plain `docker compose up` (webapp only today;
> MCP is behind `--profile mcp` once `services/mcp-server` exists).

## Current repo status

| Workload    | App location                         | docker compose | kind / Tilt |
|-------------|--------------------------------------|----------------|-------------|
| Webapp      | `apps/web/idam2-demo-finance/`       | **Ready**      | Scaffolded (Tiltfile still references old `apps/web` paths) |
| MCP server  | `services/mcp-server/` (not built yet) | **Optional** (`--profile mcp`) | Scaffolded |

The web UI is a Next.js app under `idam2-demo-finance`. The MCP server
package has not been implemented yet -- only `services/mcp-server/readme.md`.
Compose and k8s manifests already include Envoy + OPA for MCP; they stay
off until you add the app and enable the MCP profile (compose) or deploy
the mcp-server workload (k8s).

## Pod pattern

Every workload pod has three containers:

- `envoy` -- the only container with a Service pointing at it (port 8080).
  Runs the `ext_authz` HTTP filter, calling OPA over gRPC before routing.
- `opa` -- runs `openpolicyagent/opa:latest-envoy` with the
  `envoy_ext_authz_grpc` plugin, loaded from the shared `opa-policy`
  ConfigMap. Returns `allow`/`deny`; Envoy enforces it.
- the app itself (`webapp` or `mcp-server`) -- reachable only at
  `127.0.0.1:<port>` inside the pod. There is no path to it that skips Envoy.

This is deliberately the same three-container shape for both `webapp` and
`mcp-server`, so the MCP server's authorization path is identical to the
web UI's -- an agent calling a tool goes through the same PEP/PDP chokepoint
a browser session does.

## One-time setup

```bash
brew install kind tilt-dev/tap/tilt kubectl   # or your platform's equivalent

kind create cluster --config kind-config.yaml

# ingress-nginx for kind (check the ingress-nginx docs for the current
# manifest URL/version for your kind release before running this):
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "127.0.0.1 coffer.local" | sudo tee -a /etc/hosts
```

## Everyday dev loop

```bash
tilt up
```

Tilt builds the dev images, applies the manifests, and live-syncs source
into the running containers. Today the webapp under
`apps/web/idam2-demo-finance/` is the app that exists; the Tiltfile still
syncs `apps/web` as a directory (which covers that subfolder). The MCP
server sync target (`apps/mcp-server`) does not match the intended
`services/mcp-server/` layout yet -- update `Tiltfile` and
`docker/mcp-server.Dockerfile.dev` when you add the MCP package.

`tilt down` tears the workloads back down; `kind delete cluster --name
coffer-lab` nukes the whole thing.

Direct port-forwards (also set up by the Tiltfile):

- webapp dev server: `localhost:3000` (bypasses Envoy -- use this for pure
  frontend iteration; use `coffer.local` below to test through the PEP)
- MCP server: `localhost:8000` (once `services/mcp-server` is implemented)
- Postgres: `localhost:5432`

### Bringing up MCP (compose)

See `COMPOSE.md` for the full checklist. In short: add a Node (or other)
server under `services/mcp-server/` with `package.json` + `npm run dev` on
port 8000, then:

```bash
docker compose --profile mcp up --build
```

MCP through its PEP: `http://localhost:8081`.

## Faking tokens for policy testing

Three layers, fastest feedback loop first:

**1. Unit test the Rego directly -- no token, no Envoy, no cluster.**
`opa/policy_test.rego` fakes `input` at the exact shape the
`envoy_ext_authz_grpc` plugin builds it (`attributes.request.http.{method,path,headers}`).
A `token()` helper mints an unsigned `alg:none` JWT inline so `claims.role`
resolves without ever touching a real signer:

```bash
opa test opa/ -v
```

**2. Poke it from the CLI with a hand-built input file** -- useful when you
just want to try one shape without writing a test case:

```bash
opa eval \
  --data opa/policy.rego \
  --input <(echo '{"attributes":{"request":{"http":{
    "method":"POST","path":"/mcp/tools/transfer-funds",
    "headers":{"authorization":"Bearer eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWdlbnQifQ."}
  }}}}') \
  "data.envoy.authz.allow"
```

**3. End-to-end through the real Envoy + OPA sidecars** -- here you need an
actual `Authorization` header on the wire, since Envoy (not OPA) builds
`input` from the raw request. `scripts/make-test-jwt.sh` mints the same
style of unsigned token for curl:

```bash
curl -i http://coffer.local/mcp/tools/read-balance \
  -X POST -H "Authorization: Bearer $(./scripts/make-test-jwt.sh agent)"
```

All three work only because the policy calls `io.jwt.decode` (parse, no
signature check). That's intentional for a lab and a hard blocker before
anything past it -- swap in `io.jwt.decode_verify` against your real issuer's
JWKS and every unsigned token above starts failing, which is exactly the
point at which you'd switch `policy_test.rego`'s fixtures to real
`io.jwt.encode_sign` output instead.

You can also skip hand-building fixtures altogether: `decision_logs.console`
is already on in `opa/config.yaml`, so `kubectl logs -f deploy/webapp -n
coffer -c opa` prints the real `input` document for every request Envoy
actually sent. Copy one straight into a test case when you want a
regression test for a real interaction instead of a synthetic one.

## Testing the PEP/PDP path

Through the ingress, all traffic passes Envoy -> OPA before reaching the app:

```bash
# no Authorization header, hits a non-public path -> 403 from Envoy/OPA
curl -i http://coffer.local/api/private

# public route -> 200, no token needed
curl -i http://coffer.local/api/public/health

# with a faked token -> 200 (see "Faking tokens for policy testing" above)
curl -i http://coffer.local/api/private -H "Authorization: Bearer $(./scripts/make-test-jwt.sh admin)"
```

Watch decisions live:

```bash
kubectl logs -f deploy/webapp -n coffer -c opa
kubectl logs -f deploy/mcp-server -n coffer -c opa
```

## Phase 2: SPIFFE/SPIRE

`phase2-spire/` is a scaffold, not wired into phase 1 yet:

1. Give `mcp-server` its own ServiceAccount (uncomment the line in
   `k8s/05-mcp-server.yaml`).
2. `kubectl apply -f phase2-spire/10-spire-server.yaml -f phase2-spire/11-spire-agent.yaml`
3. `./phase2-spire/12-register-mcp-workload.sh` to create the registration
   entry binding `k8s:ns:coffer` + `k8s:sa:mcp-server` to
   `spiffe://coffer.internal/mcp-server`.
4. Mount the agent socket (`/run/spire/sockets`) into the mcp-server pod --
   already commented in `05-mcp-server.yaml`.
5. Replace the plaintext `local_app`/`opa_ext_authz` transport in
   `envoy-config-mcp` with an SDS `transport_socket` reading from that
   socket, so Envoy terminates mTLS using the workload's SVID instead of
   a static cert. This is the point where "Envoy trusts whoever's on
   localhost" becomes "Envoy trusts a cryptographically attested workload
   identity" -- the piece that makes the agentic-identity story real rather
   than assumed.

Notes:

- `trust_domain` is set to `coffer.internal` -- change it before this touches
  anything real.
- The agent config uses `insecure_bootstrap = true` for lab convenience only.
  Pin the trust bundle before doing anything beyond local demoing.
- `NodeAttestor "k8s_psat"` requires the projected service account token
  volume to be enabled on your cluster (on by default in recent
  kind/kubeadm; check if attestation fails).
