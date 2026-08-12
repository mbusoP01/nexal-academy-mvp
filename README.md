# Nexal Academy

Nexal Academy is a static, mobile-friendly learning platform for South African
secondary/FET learners. The current V1 scope is Grades 10–12 foundations in
Pure Mathematics, Physical Sciences and Life Sciences.

## Architecture

- HTML pages provide public, dashboard, library, Study Hall and Arena routes.
- `js/curriculum.js` is the stable curriculum source of truth.
- `js/validate-content.js` validates IDs, lesson depth, practice answers and
  video metadata.
- Supabase provides authentication and learner/profile persistence when the
  configured project is available. Client configuration uses only the public
  anon key; no service-role key belongs in this repository.

## Local checks

```bash
npm run check:syntax
npm run validate:content
python -m http.server 4173
```

Open `http://127.0.0.1:4173/index.html`. Authenticated pages require the
configured Supabase project and a valid learner profile.

## Content authoring

Add stable module IDs and structured theory/practice objects to
`js/curriculum.js`, then run the validator before committing. A missing video
must be marked honestly as `SCRIPT_READY` rather than rendered as a fake player.

## Deployment

This repository is static-hosting compatible. Deploy through the existing
authorized hosting workflow after local syntax, content and browser smoke gates
pass. Live Supabase/RLS verification is an external release gate.
