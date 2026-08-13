# TxDxNet — repository guidance

## Product

`txdxnet.com` is the editorial platform for TxDxSecure. Public readers browse without accounts. Only the editorial team authenticates through Payload at `/admin`.

## Architecture

- Next.js App Router + TypeScript strict mode.
- Payload CMS integrated in the same application.
- Tailwind CSS v4 with CSS-first tokens in `src/app/(website)/globals.css`.
- PostgreSQL hosted by Supabase; Payload tables use the private `cms` schema.
- Supabase Storage through Payload's S3 adapter in production.
- Modules under `src/modules`; Payload collections under `src/collections`.

## Guardrails

- Never expose database passwords, S3 credentials, Payload secrets, service-role keys, or server-only variables to the browser.
- Public content reads go through server-side Payload APIs. Do not add direct browser access to PostgreSQL.
- Keep `txdxnet.com` as the canonical production origin.
- Preserve Spanish as the primary editorial language.
- Public UI must meet WCAG 2.2 AA and respect `prefers-reduced-motion`.
- Use the brand tokens; do not introduce generic purple gradients or default component-library styling.
- Generate and review migrations before remote schema changes. Never rely on production `db push`.

## Verification

Before handoff, run:

```powershell
npm run lint
npm run typecheck
npm run build
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
