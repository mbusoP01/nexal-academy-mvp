# Premium content security status

## Current state

The legacy Academy curriculum is static JavaScript and the repository is
public. Full lesson bodies, authored practice and diagrams committed there
must be treated as publicly visible. Frontend locks cannot protect this data.

## Local commercialisation foundation

`content/access-manifest.json` defines showcase lessons and preview tiers.
`js/entitlements.js` defaults safely to FREE and supports only explicit local
fixture values for browser tests. A URL query string cannot grant Premium.
`pricing.html` provides a provider-neutral upgrade boundary without fake
checkout or pricing.

## Required production migration

Move full lesson bodies, complete question banks, assessment memos and Premium
video metadata into protected Supabase tables/storage with trusted entitlement
records and RLS. Keep only catalog metadata, teasers and approved free samples
in the public bundle. Validate that a FREE user receives no Premium payload.

Do not rewrite public Git history automatically. Change repository visibility or
remove historical Premium assets only with owner authorization and a validated
protected destination.
