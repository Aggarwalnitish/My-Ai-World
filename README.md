# My AI World

A smart, personal tracker for the AI tools and ideas you discover. Paste a tool
(name or link) and it auto-writes a summary and sorts it into a category. Jot
down a concept (like GEO) and it pulls an explainer from the web that sits next
to your own notes. Get reports of what you added today, yesterday, this week, or
this month — grouped by category.

Built with **Next.js 16**, **Tailwind CSS v4**, **Prisma + Postgres**, and the
**Claude API** (with web search) as the brain. No login — it's meant for one
person; deploy it to Vercel and use the URL.

---

## What you need (one-time)

1. **Anthropic API key** — https://console.anthropic.com → **API Keys**. Powers
   the summaries, categorization, and web lookups.
2. **A Postgres database** — easiest is **Supabase** (free):
   https://supabase.com → New project → **Connect** → copy the connection strings.

---

## Local setup

```bash
npm install

# Fill in .env (see .env.example):
#   ANTHROPIC_API_KEY = sk-ant-...
#   ANTHROPIC_MODEL   = claude-haiku-4-5   (cheapest; or claude-sonnet-4-6 / claude-opus-4-8)
#   DATABASE_URL      = Supabase pooler URL (port 6543) + ?pgbouncer=true
#   DIRECT_URL        = Supabase session/direct URL (port 5432)

# Create the database tables
npx prisma db push

# Run it
npm run dev
# open http://localhost:3000
```

> The app boots even before you add the keys — it shows a "setup needed" banner
> and the smart features turn on once `ANTHROPIC_API_KEY` and `DATABASE_URL` are set.

### Supabase connection strings

In Supabase → **Connect**, copy the **Transaction pooler** (port 6543) for
`DATABASE_URL` and the **Session pooler** (port 5432) for `DIRECT_URL`. If your
database password contains symbols, URL-encode them (e.g. `@` → `%40`).

```
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

---

## Deploy to Vercel

1. Push to GitHub (already wired to `Aggarwalnitish/My-Ai-World`).
2. https://vercel.com → **Add New → Project** → import the repo.
3. Add **Environment Variables**: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`,
   `DATABASE_URL`, `DIRECT_URL`.
4. Deploy. The build runs `prisma generate && next build` automatically.

> ⚠️ On Vercel the `db.<ref>.supabase.co` **direct** connection won't work
> (IPv6-only). Use the Supabase **pooler** strings (above) for `DATABASE_URL`
> and `DIRECT_URL`.

> ⚠️ There's no login, so anyone with the deployed URL can view and edit your
> data. Vercel URLs are random and unlisted, so keep yours private.

---

## Configuration

| Env var | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | for AI | Enables summaries, categorization, web lookups. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-opus-4-8`. Set `claude-haiku-4-5` for lowest cost. |
| `DATABASE_URL` | yes | Pooled Postgres URL (used at runtime). |
| `DIRECT_URL` | for migrations | Direct/session Postgres URL (used by `prisma db push`). |

---

## How it works

- **Adding a tool** → Claude searches the web and fetches the official site, then
  a structured-output call returns a clean summary, the best-fit category, and
  tags. Saved to the `Tool` table.
- **Adding a learning** → Claude researches the concept and returns a markdown
  explainer, key points, and source links — stored alongside your own notes in
  the `Note` table.
- **Reports** → group everything added in a date range by category, with an
  optional one-click AI digest.

Enrichment runs server-side (your API key never reaches the browser) and takes a
few seconds per item; the UI shows a loading state while it works.

## Project structure

```
app/
  (app)/            dashboard, tools, notes, reports + detail pages
  api/              tools, notes, report digest
components/         UI: quick-add, cards, nav, explorers, markdown, editors
lib/                db, ai (Claude), taxonomy, data access
prisma/schema.prisma
```
