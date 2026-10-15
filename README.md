# Institutional Readiness

A local-first interactive prototype for an evidence-led AI readiness diagnostic for UK film departments.

## Run

Use Node.js 24 and `npm ci`, then `npm run dev`. `npm test` checks scoring rules; `npm run build` checks TypeScript and produces `dist/`.

## Included

Cinematic dark dashboard; original 36-question rubric; editable department name; maturity ratings, unknown and non-applicable states; evidence references and notes; action ownership and completion; curated primary-source library; report with coverage and index withholding; JSON export and printable report.

The fictional Northbank example is seeded on first visit. Edits are saved in this browser's local storage. Do not enter confidential institutional evidence. Scores are self-reported and unreviewed; the app does not certify compliance. Non-applicability choices require future human review. The methodology is original and unvalidated.

## Current limits

No authentication, shared database, document upload, automated source monitoring, human review workflow or connected AI. These are planned in `app-plan.md`. This prototype is the first milestone, not a production institutional service. JSON exports preserve local work; import is not yet implemented. Google Fonts are optional external stylesheet assets; system fonts provide a fallback.

## Netlify / Git

`netlify.toml` declares the Vite build and SPA routing. Production connection has not been made. Connect the intended Git repository to Netlify when ready; build command `npm run build`, publish directory `dist`. Add API-specific routing before introducing functions. The `.netlify` folder and secrets are ignored. Use separate development and production services before handling institutional records.
