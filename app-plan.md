# Institutional Readiness — Git and Netlify app plan

Planning date: 15 October 2026. Companion to blueprint.md and assessment-framework.csv. Proposed architecture; no repository, hosting project, account or infrastructure has been created.

## Product and first release

A private workspace for UK film departments to assess AI readiness across policy, technical infrastructure and faculty literacy, review evidence, and agree an improvement plan. The app produces strategic diagnostics, not compliance certificates.

The first usable release supports one complete journey: create a department → scope an assessment → answer 36 questions → attach evidence → review scores and activity-specific concerns → approve a report → assign actions → reassess.

Include a separate fictional demo workspace. Label example data and simulated AI explicitly. Real assessments require authentication and persistent server-side storage.

## Recommended architecture

| Layer | Proposed choice | Reason / condition |
|---|---|---|
| Source control | Private GitHub repository, Git as source of truth | Default recommendation; GitLab remains compatible if preferred |
| Web app | React, TypeScript, Vite, React Router | A workspace app has little initial need for server-rendered pages |
| Hosting and API | Netlify CDN and TypeScript Netlify Functions | Static frontend with authenticated server operations |
| Relational data | PostgreSQL, initially evaluate Netlify Database | Structured responses, memberships, versions and transactions; confirm account availability, region and contractual suitability |
| File storage | Evaluate Netlify Blobs behind authenticated functions | Evidence files must never be publicly served; confirm residency, retention and operational limits before institutional use |
| Authentication | Managed OIDC provider, pilot with invite-only accounts | Select provider after checking university Microsoft/Google federation needs, SSO, region and pricing; isolate integration behind an auth module |
| AI | Server-side provider adapter, one approved model initially | Model can be changed without rewriting assessment logic; verify retention and processing terms before real uploads |
| Validation | Shared schemas, deterministic scoring, Vitest; Playwright for critical journeys | Protect scoring, permissions and the complete user flow |

Keep standard SQL migrations and storage/auth adapters to avoid unnecessary hosting dependence. Do not promise that all processing is UK-only because the frontend is aimed at UK institutions. Verify storage, functions, identity, model provider, logs and backups separately.

Use authenticated server sessions with secure cookies and CSRF protections where applicable. Every API and download validates membership and role. Never trust an institution ID supplied by the browser as proof of access. Private responses use appropriate no-store caching rules.

## Screens and navigation

1. **Overview:** active assessments, three pillars, evidence coverage, unresolved decisions and priority actions.
2. **Assessment:** scope setup, six domain sections, autosave, progress, unknown/not applicable choices, evidence links and review state.
3. **Evidence:** documents, pasted excerpts and external references; source locations, access restrictions, review dates and AI suggestions.
4. **Review:** contributor disagreements, evidence sufficiency, proposed versus accepted scores, scenario outcomes and human decisions on use cases.
5. **Action plan:** owner, due date, dependency, effort, budget assumption, completion evidence and status.
6. **Reports:** frozen assessment snapshots, accessible HTML, print layout, CSV and JSON. Add reliably generated PDFs after the printable report is validated.
7. **Knowledge library:** curated UK sources, their applicability and review dates; distinguish reviewed material from pending updates.
8. **Administration:** members, roles, department settings, rubric versions, source editing, retention and audit history.

Design direction: calm, editorial and suitable for academic leaders, with restrained film references. Prioritise legible evidence and clear decisions. Target WCAG 2.2 AA and include actual keyboard and screen-reader testing.

## Roles and workflow

Organisation administrator manages membership and departments. Assessment lead creates and coordinates an assessment. Contributors provide answers and evidence within their assignment. Reviewers accept evidence, confirm applicability and scores, and approve reports. Viewers read explicitly shared results. Knowledge editors maintain public guidance but receive no implicit access to institutional evidence.

Assessment lifecycle: draft → collecting evidence → in review → approved → archived. Reassessment creates a new record linked to its predecessor. Approved reports are immutable snapshots; corrections create a new version with a reason and reviewer.

Allow one person to hold multiple roles in a small pilot, but record who contributed and who reviewed. Retain audit events for permission changes, scoring decisions, evidence deletion and report approval.

## Data and scoring contract

Core tables: organisations, departments, users, memberships, rubric_versions, questions, assessments, responses, evidence, evidence_links, review_decisions, use_cases, gates, scenario_attempts, actions, source_versions, ai_jobs, ai_suggestions, report_snapshots and audit_events.

Tenant-owned tables carry organisation identifiers and enforce ownership through scoped queries and database constraints. Evidence links cannot cross tenants. Use optimistic concurrency on answers and decisions so concurrent contributors cannot silently overwrite each other.

Seed the 36 original questions as a versioned rubric. Implement the blueprint's 0–4 anchors, evidence levels, coverage and equal pillar weights as pure functions. Unknown remains distinct from zero. Reviewed not-applicable items leave the denominator. Suppress an overall score when a domain has less than 80% coverage or a gate is unresolved. Fully non-applicable domains produce no numeric score; suppress the overall index rather than divide by zero or silently reweight it. The 15-question orientation is explicitly a partial mode.

Store accepted scores separately from AI suggestions and contributor self-ratings. Reports record rubric version, source versions, evidence references, coverage, unresolved concerns and approver. No benchmarking percentiles in the first release.

## AI and document processing

Start with pasted text and text-based PDF/DOCX uploads. Reject unsupported and oversized files clearly; add OCR later. Begin with a conservative file-size limit verified against the deployed upload path. Files do not travel inside background-job payloads: pass a job ID and authorised storage reference.

Workflow: authorised upload → type/size validation and file safety checks → stored document → extraction job → source passages → AI comparison/recommendations → schema and citation checks → reviewer acceptance. Validate source references against the actual extracted passages; a model-provided citation alone is not sufficient.

AI may propose policy gaps, conflicting rules, follow-up questions and actions. It cannot silently approve scores, decide legal compliance, grade students or rewrite institutional policy. Documents are untrusted inputs and cannot change system instructions or grant tools additional permissions.

Use a persisted job state machine: queued, running, succeeded, failed, cancelled. Include idempotency keys, bounded retries, timeouts, usage limits and an explicit user retry. Netlify background functions are candidates for bounded processing; workloads exceeding platform limits require a separately evaluated worker. Do not rely on a process continuing after a request ends.

Initial retrieval can use authorised, selected passages rather than a vector database. Add semantic retrieval only if pilot evidence shows it improves relevant document review. Every retrieval path must apply tenant and document access restrictions.

## Git repository layout

```text
src/
  app/                 # Routes, navigation and application shell
  features/            # Assessment, evidence, reviews, actions, reports
  components/          # Accessible shared interface components
shared/
  scoring/             # Pure scoring and coverage functions
  schemas/             # Shared request and data validation
server/
  auth/                # Session and permission checks
  data/                # Tenant-scoped persistence
  ai/                  # Provider adapter and suggestion validation
  documents/           # Extraction and evidence processing
netlify/
  functions/           # API, background and scheduled entry points
  database/migrations/ # Append-only SQL migration history
content/
  rubrics/             # Versioned framework definitions
  sources/             # Reviewed public source metadata
tests/                 # Scoring, permissions, integration and journeys
docs/                  # Blueprint, architecture, operations, methodology
.github/workflows/     # CI checks
netlify.toml
.env.example           # Names and harmless placeholders only
```

Keep institutional evidence, assessment exports, credentials and runtime data out of Git. Commit a lockfile and supported runtime version. Ignore .netlify, local environment files, build output and temporary uploads.

## Git-to-Netlify deployment

Use feature branches and reviewed pull requests into protected main. CI runs type checking, critical tests and a production build. Netlify builds from the connected repository. Configure the Vite build to publish dist and keep Netlify Functions outside it. Configure SPA routing without intercepting API paths.

Use two Netlify projects connected to the repository:

- **Development/staging project:** development branch and PR previews, synthetic fixtures, non-production identity/model credentials and isolated storage/database.
- **Production project:** main only; disable unnecessary branch and PR previews here. Use production credentials and real institutional records only after pilot readiness checks.

This separation is intentional: automatic database branches may copy their parent data. Do not base public review environments on production records. Previews must be synthetic and isolated even if their URLs are shareable. Verify actual branch and storage scoping before inviting reviewers.

Store secrets through Netlify's environment-variable controls with appropriate runtime scopes; never in netlify.toml or VITE_ variables. Redeploy after configuration changes. Protect workspace routes with application authentication; a private repository does not protect the deployed application.

Commit migrations and apply them through the chosen deployment workflow. Use backwards-compatible schema changes; never edit applied migrations. Fix a bad published release by reverting/correcting its Git commit and redeploying. A code revert does not reverse a database migration. Test backup restoration separately with synthetic data and document recovery objectives before real pilots.

## Delivery milestones

| Milestone | Scope | Completion evidence |
|---|---|---|
| 1. Foundation and demo | Repo structure, Netlify preview workflow, visual shell, versioned questions, scoring module, fictional data | Preview builds from a PR; scoring edge cases pass; demo cannot be mistaken for a live assessment |
| 2. Working diagnostic | Authentication, departments, membership, saved responses, evidence references, review, actions and exports | Two authorised users complete the workflow; unauthorised access tests fail safely; data survives redeploys |
| 3. AI-assisted pilot | Document upload/extraction, cited suggestions, manual acceptance, usage controls and immutable reports | AI claims trace to actual passages; job retries are safe; malicious documents cannot trigger external actions |
| 4. Maintained intelligence | Curated source register, scheduled change checks, editorial queue and source-version impact notices | Changed/stale sources are visible; changes require editorial approval before recommendations update |
| 5. Institutional expansion | University SSO, richer reporting, reassessment comparison and approved integrations | Pilot findings support expansion; permissions, accessibility, recovery and operations reviewed |

Milestones 2 and 3 together form the useful AI pilot release. Milestone 1 is an internal demonstration, not the finished product. Estimate calendar duration after the identity provider, institutional data constraints and pilot capacity are known.

## Release checks and operating costs

Prioritise tests for scoring/coverage, zero versus unknown, all-not-applicable domains, tenant isolation, reviewer-only approval, simultaneous edits, private evidence downloads, job duplication and exports matching the approved snapshot. Test full journeys and accessibility in a browser before pilots. No real institution has yet tested this rubric.

Monitor failed jobs, request errors, model usage, spend per assessment, storage growth and source-review backlog. Exclude document text and sensitive model inputs from routine logs. Give an accountable operator a failure queue and a documented incident process.

Budget categories: Netlify hosting/functions/database/storage, identity provider, AI tokens, document processing, monitoring, backup operations and editorial maintenance. Use synthetic pilots to measure these before quoting a monthly price. Model costs must include retries and long documents. Editorial upkeep is recurring human work, not something a schedule alone supplies.

## Decisions before implementation

Working assumptions: new private GitHub repository named institutional-readiness; Netlify Git continuous deployment; one pilot organisation with support for multiple departments; invite-only accounts; public marketing page plus private workspace; no billing or subscription checkout in the pilot.

Before connecting external services, identify the GitHub owner/repository and Netlify team. Before handling real evidence, choose the identity and AI providers, confirm service locations and processing terms, set retention, and identify the institutional reviewer. These choices need not prevent development of the demo, rubric and scoring engine.

## Platform references

Implementation should verify current account features and limits against [Netlify framework documentation](https://docs.netlify.com/build/frameworks/), [Git-based deployment](https://docs.netlify.com/build/git-workflows/overview/), [Functions documentation](https://docs.netlify.com/build/functions/overview/), and the available Netlify deployment, database and storage skill guidance. This document is a plan; no deployments or paid services have been started.
