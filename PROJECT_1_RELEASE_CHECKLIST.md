# Project 1 Release Checklist

## Local product quality
- [x] Known-good branch preserved
- [x] Three core subjects load from shared curriculum data
- [x] Structured Study Hall and Arena routes exist
- [x] Auth guard parses and redirects safely
- [x] Full Grades 10–12 coverage manifest complete (54/54 mapped CAPS units)
- [x] Project 1 deterministic local quality suite passes
- [x] Desktop browser smoke checks pass
- [x] Mobile browser smoke checks pass
- [x] Browser screenshots are retained as CI evidence
- [x] Academy avatar storage contract is private-by-default with owner-folder RLS and signed rendering
- [x] Announcement audience constraints reject missing target fields
- [x] LMS grants are explicit and deny unintended authenticated writes

## Live release gates
- [ ] Live Academy Supabase database is awake and its schema/RLS has been inspected
- [ ] `profiles` and related relationship data have a verified least-privilege production authorization model
- [ ] Authenticated Supabase learner journey is verified with a production test account
- [ ] Google OAuth provider/callback configuration is verified end-to-end
- [ ] Protected Premium lesson/question/memo storage and entitlement-backed RLS are deployed and denial-tested
- [ ] Real Premium payment checkout/webhook-to-entitlement flow is verified
- [ ] Authorized Academy production hosting target is confirmed and deployment smoke-tested

`npm run project1:status` must report `PROJECT_1_RELEASE_READY=YES` before Project 1 is described as production-ready. Local/browser green is necessary but is not a substitute for these live gates.
