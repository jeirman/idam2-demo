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

test_agent_transfer_allowed_during_passthrough if {
	allow with input as req("POST", "/mcp/tools/transfer-funds", token({"role": "agent"}))
}

# Passthrough phase: default allow := true keeps unauthenticated routes open.
test_missing_token_allowed_during_passthrough if {
	allow with input as req("GET", "/api/private/whatever", null)
}

test_garbage_bearer_allowed_during_passthrough if {
	allow with input as req("GET", "/api/private/whatever", "Bearer not-a-jwt")
}

test_claims_from_cookie_priya if {
	inp := req_with_cookie("GET", "/home", profile_token({
		"sub": "priya",
		"name": "Priya Shah",
		"department": "Finance",
		"job_title": "Payments Clerk",
		"country": "UK",
		"initials": "PS",
	}))
	claims_with_input(inp).job_title == "Payments Clerk"
	claims_with_input(inp).sub == "priya"
	claims_with_input(inp).department == "Finance"
	claims_with_input(inp).country == "UK"
}

test_claims_from_cookie_maya if {
	inp := req_with_cookie("GET", "/home", profile_token({
		"sub": "maya",
		"name": "Maya Chen",
		"department": "Finance",
		"job_title": "Finance Approver",
		"country": "UK",
		"initials": "MC",
	}))
	claims_with_input(inp).job_title == "Finance Approver"
	claims_with_input(inp).sub == "maya"
}

test_claims_from_cookie_tomas if {
	inp := req_with_cookie("GET", "/home", profile_token({
		"sub": "tomas",
		"name": "Tomas Weber",
		"department": "Finance",
		"job_title": "Finance Manager",
		"country": "UK",
		"initials": "TW",
	}))
	claims_with_input(inp).job_title == "Finance Manager"
	claims_with_input(inp).sub == "tomas"
}

test_authorization_header_wins_over_cookie if {
	inp := req_with_cookie_and_bearer(
		"GET",
		"/home",
		profile_token({"sub": "priya", "job_title": "Payments Clerk"}),
		token({"role": "admin"}),
	)
	claims_with_input(inp).role == "admin"
}

claims_with_input(inp) := result if {
	result := claims with input as inp
}

# --- fixtures -----------------------------------------------------------

req(method, path, bearer) := {"attributes": {"request": {"http": {
	"method": method,
	"path": path,
	"headers": auth_header(bearer),
}}}}

req_with_cookie(method, path, cookie_value) := {"attributes": {"request": {"http": {
	"method": method,
	"path": path,
	"headers": {"cookie": sprintf("coffer-token=%s", [cookie_value])},
}}}}

req_with_cookie_and_bearer(method, path, cookie_value, bearer) := {"attributes": {"request": {"http": {
	"method": method,
	"path": path,
	"headers": object.union(
		{"cookie": sprintf("coffer-token=%s", [cookie_value])},
		auth_header(bearer),
	),
}}}}

auth_header(bearer) := {"authorization": bearer} if bearer != null

auth_header(bearer) := {} if bearer == null

token(claims) := sprintf("Bearer %s.%s.", [
	base64url.encode_no_pad(json.marshal({"alg": "none"})),
	base64url.encode_no_pad(json.marshal(claims)),
])

profile_token(claims) := sprintf("%s.%s.", [
	base64url.encode_no_pad(json.marshal({"alg": "none"})),
	base64url.encode_no_pad(json.marshal(claims)),
])
