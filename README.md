# My AI World

A smart, personal tracker for the AI tools and ideas you discover. Paste a tool
(name or link) and it auto-writes a summary and sorts it into a category. Jot
down a concept (like GEO) and it pulls an explainer from the web that sits next
to your own notes. Get reports of what you added today, yesterday, this week, or
this month — grouped by category.

Built with **Next.js 16**, **Tailwind CSS v4**, **Prisma + Postgres**, and the
**Claude API** (with web search) as the brain. Password-protected, deployable to
Vercel.

---

## What you need (one-time)

1. **Anthropic API key** — https://console.anthropic.com → **API Keys** → create
   one. Powers the summaries, categorization, and web lookups.
2. **A Postgres database** — easiest is **Supabase** (free):
   https://supabase.com → New project → wait for it to provision →
   **Project Settings → Database → Connection string**.
3. **A password** you'll use to log in, and a random **session secret**.

---

## Local setup

```bash
# 1. Install dependencies (already done if you're handed this folder)
npm install

# 2. Fill in your secrets — edit .env.local (see .env.example for the shape)
#    ANTHROPIC_API_KEY = sk-ant-...
#    DATABASE_URL      = Supabase "Transaction" pooler URL (port 6543) + ?pgbouncer=true
#    DIRECT_URL        = Supabase direct/session URL (port 5432)
#    APP_PASSWORD      = your login password
#    AUTH_SECRET       = 32+ random chars (see command below)

# Generate a strong AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Create the database tables from the schema
npx prisma db push

# 4. Run it
npm run dev
# open http://localhost:3000  →  log in with APP_PASSWORD
```

> The app boots even before you add the keys — it just shows a "setup needed"
> banner and the smart features stay off until `ANTHROPIC_API_KEY` and
> `DATABASE_URL` are set.

### Example Supabase connection strings

```
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

---

## Deploy to Vercel

1. Put the code on GitHub:
   ```bash
   git init && git add . && git commit -m "My AI World"
   # create a repo on github.com, then:
   git remote add origin https://github.com/<you>/my-ai-world.git
   git push -u origin main
   ```
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. Add the **Environment Variables** (same names as `.env.local`):
   `ANTHROPIC_API_KEY`, `DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD`,
   `AUTH_SECRET` (use a fresh strong value for production).
4. Deploy. The build runs `prisma generate && next build` automatically.
5. First time only: run `npx prisma db push` locally (pointed at the same
   `DATABASE_URL`) to create the tables, or let it run against Supabase before
   first use.

Open the Vercel URL on your phone and log in — that's it.

---

## Configuration

| Env var | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | for AI | Enables summaries, categorization, web lookups. |
| `DATABASE_URL` | yes | Pooled Postgres URL (used at runtime). |
| `DIRECT_URL` | for migrations | Direct Postgres URL (used by `prisma db push`). |
| `APP_PASSWORD` | yes | Your login password. |
| `AUTH_SECRET` | yes | 32+ random chars; signs the session cookie. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-opus-4-8`. Set to `claude-haiku-4-5` or `claude-sonnet-4-6` to lower cost. |

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
  (app)/            protected pages: dashboard, tools, notes, reports + details
  login/            password gate
  api/              auth, tools, notes, report digest
components/         UI: quick-add, cards, nav, explorers, markdown, editors
lib/                db, ai (Claude), auth, taxonomy, data access
prisma/schema.prisma
middleware.ts       redirects to /login when not authenticated
```
