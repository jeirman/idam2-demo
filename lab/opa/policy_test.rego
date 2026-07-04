# Run with: opa test opa/ -v
#
# These tests fake input at the level OPA actually sees it -- the JSON shape
# the envoy_ext_authz_grpc plugin builds from the incoming HTTP request. No
# real Envoy, no real Postgres, no real signed JWT. `token()` below mints an
# unsigned "alg":"none" JWT, which decodes fine under this policy's
# io.jwt.decode (no signature check) but would be rejected outright by
# io.jwt.decode_verify -- exactly the swap you make before this leaves "lab".
package envoy.authz

import future.keywords.if

test_public_get_allowed_without_token if {
	allow with input as req("GET", "/api/public/health", null)
}

test_admin_allowed_on_private_route if {
	allow with input as req("GET", "/api/private/whatever", token({"role": "admin"}))
}

test_agent_can_read_tool if {
	allow with input as req("POST", "/mcp/tools/read-balance", token({"role": "agent"}))
}

test_agent_cannot_call_transfer_tool if {
	not allow with input as req("POST", "/mcp/tools/transfer-funds", token({"role": "agent"}))
}

test_missing_token_denied_on_private_route if {
	not allow with input as req("GET", "/api/private/whatever", null)
}

test_garbage_token_denied if {
	not allow with input as req("GET", "/api/private/whatever", "Bearer not-a-jwt")
}

# --- fixtures -----------------------------------------------------------

req(method, path, bearer) := {"attributes": {"request": {"http": {
	"method": method,
	"path": path,
	"headers": auth_header(bearer),
}}}}

auth_header(bearer) := {"authorization": bearer} if bearer != null

auth_header(bearer) := {} if bearer == null

token(claims) := sprintf("Bearer %s.%s.", [
	base64url.encode_no_pad(json.marshal({"alg": "none"})),
	base64url.encode_no_pad(json.marshal(claims)),
])
