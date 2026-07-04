package envoy.authz

import future.keywords.if
import future.keywords.in
import input.attributes.request.http as http_request

# TEMP: allow-all while cookie auth isn't forwarded to OPA yet. Set back to false
# once Envoy passes a JWT (or OPA reads coffer-session) for private routes.
default allow := true

# Anonymous read-only public routes
allow if {
    http_request.method == "GET"
    startswith(http_request.path, "/api/public")
}

# Admins: full access
allow if {
    claims.role == "admin"
}

# Agentic identities: MCP tool reads only, transfer tools explicitly excluded.
# This is the seam where OpenFGA/ReBAC relationship checks slot in later --
# for now it's a flat role+path check to prove the PEP/PDP wiring works.
allow if {
    claims.role == "agent"
    http_request.method == "POST"
    startswith(http_request.path, "/mcp/tools/")
    not startswith(http_request.path, "/mcp/tools/transfer")
}

# Decodes the bearer JWT Envoy forwards unmodified. No signature verification
# here yet -- add io.jwt.decode_verify with your issuer's JWKS before this
# leaves "demo lab" status.
claims := payload if {
    auth_header := http_request.headers.authorization
    [_, encoded] := split(auth_header, " ")
    [_, payload, _] := io.jwt.decode(encoded)
}
