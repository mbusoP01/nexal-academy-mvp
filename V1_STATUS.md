# Nexal Academy V1 status

The current static application provides a working dashboard, curriculum library,
structured study-hall lessons, video metadata, and a five-question practice
arena. The curriculum data is original instructional synthesis; external video
IDs are links to third-party providers and are not redistributed by the app.

## Current structured coverage

- Pure Mathematics: Quadratic Equations, Quadratic Inequalities, Limits & First Principles, Functions & Graphs, Trigonometry & Right Triangles.
- Physical Sciences: 1D & 2D Kinematics, Newton's Laws of Motion, Work/Energy/Power, Chemical Reactions & Stoichiometry.
- Life Sciences: DNA/RNA & Replication, Inheritance & Genetic Crosses, Ecosystems & Energy Flow.

Every extension lesson includes explanatory theory, a worked example or check,
and at least one answer-backed practice question. Remaining curriculum breadth
should be expanded from the existing syllabus structure rather than presented as
complete coverage.

## Honest runtime states

Lessons without a verified external video show written content and a truthful
fallback instead of a fake player. Supabase-backed profile and XP persistence
remains provider-dependent; the local practice flow continues to provide
feedback when the provider is unavailable.
