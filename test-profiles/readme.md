# Test profiles

Canonical identity profiles for lab/demo users. Each profile is a JSON file
presented to the PEP/OPA stack as JWT claims when a user signs in via the
webapp login page.

## Files

| File | User | Job title |
|------|------|-----------|
| `priya.json` | Priya Shah | Payments Clerk |
| `maya.json` | Maya Chen | Finance Approver |
| `tomas.json` | Tomas Weber | Finance Manager |

## Fields

| Field | Description |
|-------|-------------|
| `sub` | Stable user id (matches `coffer-session` cookie) |
| `name` | Display name |
| `department` | Organizational unit |
| `job_title` | Role used by OPA policy rules |
| `country` | ISO-style country code (`UK` = United Kingdom) |
| `initials` | Avatar initials in the UI |

## Flow

1. User clicks a profile on `/login`.
2. The webapp loads the matching JSON file and mints an unsigned lab JWT.
3. JWT is stored in the `coffer-token` httpOnly cookie.
4. Envoy forwards the `Cookie` header to OPA on every request.
5. OPA decodes the JWT and evaluates policy using the claims above.
