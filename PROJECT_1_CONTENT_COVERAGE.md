# Project 1 Content Coverage

## Current machine-checked foundation (2026-08-12)

The current branch contains 12 stable authored modules across the three core
subjects, 36 original topic-quiz questions (three per module), three formative
revision-assessment blueprints, and three responsive SVG learning diagrams.
`npm run validate:content` and `npm run test:content` are the source of truth
for these counts. The manifest deliberately records remaining CAPS and
rendered-media expansion work instead of claiming that a foundation module is
an entire Grades 10–12 curriculum.

The machine-readable source is `js/curriculum.js`; `js/validate-content.js`
reports actual module, practice and media coverage. A module is not counted as
complete unless it has theory and answer-backed practice.
