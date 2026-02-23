# Rival — Competitive Intelligence Dashboard

Automated competitive analysis powered by AI. Scrapes competitor websites, extracts features, pricing, messaging, and content strategy, and surfaces gaps and opportunities.

**Stack:** Next.js 16 · React 19 · Supabase (Auth + PostgreSQL) · Firecrawl · Anthropic Claude · Tailwind CSS v4

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [API Keys Required](#api-keys-required)
- [Local Development](#local-development)
- [Cloud / Staging (Vercel + Supabase)](#cloud--staging-vercel--supabase)
- [Environment Variables Reference](#environment-variables-reference)
- [Database Migrations](#database-migrations)
- [Available Scripts](#available-scripts)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org) | 20+ | Runtime |
| [npm](https://www.npmjs.com) | 10+ | Package manager |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Local Supabase stack |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | Latest | Local database management |

Install the Supabase CLI:

```bash
npm install -g supabase
```

---

## API Keys Required

You need accounts and API keys for three external services:

| Service | Purpose | Get Key |
|---------|---------|---------|
| [Firecrawl](https://firecrawl.dev) | Web scraping | firecrawl.dev/app/api-keys |
| [Anthropic](https://console.anthropic.com) | AI analysis (Claude) | console.anthropic.com/keys |
| Supabase | Database + Auth | Created during setup below |

---

## Local Development

Everything runs locally: Next.js dev server, Supabase (auth + database), and Postgres — no cloud services required.

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd rival
npm install
```

### 2. Start local Supabase

Docker Desktop must be running before this step.

```bash
npx supabase start
```

This starts the full Supabase stack locally. On first run it pulls Docker images (~2 GB). When ready, it outputs your local credentials:

```
API URL:     http://127.0.0.1:54321
Anon Key:    eyJ...
Service Key: eyJ...
DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:  http://127.0.0.1:54323
```

### 3. Apply database migrations

```bash
npx supabase db reset
```

This creates all tables, indexes, and RLS policies defined in `supabase/migrations/`.

### 4. Configure environment variables

Create `.env.local` in the `rival/` directory:

```bash
# Supabase — use the values printed by `npx supabase start`
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<service-key-from-supabase-start>

# Firecrawl
FIRECRAWL_API_KEY=<your-firecrawl-api-key>

# Anthropic
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### 5. Start the development server

```bash
npm run dev
```

### Local service URLs

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase Studio (DB admin) | http://127.0.0.1:54323 |
| Supabase API | http://127.0.0.1:54321 |
| PostgreSQL (direct) | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

### Stopping local Supabase

```bash
npx supabase stop
```

---

## Cloud / Staging (Vercel + Supabase)

The web server and app are hosted on Vercel. The database and auth are hosted on Supabase cloud.

### 1. Create a Supabase cloud project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~2 minutes)
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Apply database migrations to Supabase cloud

Link your local project to the cloud project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

> Your project ref is in the Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`

Push all migrations to the cloud database:

```bash
npx supabase db push
```

Verify in the Supabase dashboard under **Table Editor** that the `companies` and `analyses` tables exist.

### 3. Deploy to Vercel

**Option A — Vercel CLI:**

```bash
npm install -g vercel
vercel deploy
```

Follow the prompts to link to your Vercel account and project.

**Option B — Vercel Dashboard:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set the **Root Directory** to `rival`
4. Vercel auto-detects Next.js — leave framework settings as defaults
5. Click **Deploy**

### 4. Set environment variables in Vercel

In the Vercel dashboard, go to your project → **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase cloud project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `FIRECRAWL_API_KEY` | Your Firecrawl API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

Set all variables for the **Production** and **Preview** environments.

### 5. Redeploy

After adding environment variables, trigger a new deployment:

```bash
vercel deploy --prod
```

Or push a commit to your connected Git branch — Vercel deploys automatically.

### 6. Configure Supabase Auth redirect URLs

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** Add `https://your-app.vercel.app/**`

This ensures email confirmation and OAuth redirects work correctly in production.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (local: `http://127.0.0.1:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key for client-side requests |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key for server-side admin operations |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web scraping |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude AI analysis |

> **Security:** Never commit `.env.local` to version control. `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are server-side only — never expose them to the browser.

---

## Database Migrations

Migrations live in `supabase/migrations/` and are applied in filename order.

| Migration | Description |
|-----------|-------------|
| `20240221000000_initial_schema.sql` | Companies and analyses tables, indexes, RLS policies |
| `20240222000000_add_progress_tracking.sql` | Adds `progress_message` column to analyses table |

**Apply locally:**

```bash
npx supabase db reset        # Wipes and reapplies all migrations
```

**Apply to cloud:**

```bash
npx supabase db push         # Applies pending migrations only
```

**Create a new migration:**

```bash
npx supabase migration new <migration-name>
```

---

## Available Scripts

Run all commands from the `rival/` directory.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production build locally |
| `npm run lint` | Run ESLint |
| `npx supabase start` | Start local Supabase stack (requires Docker) |
| `npx supabase stop` | Stop local Supabase stack |
| `npx supabase db reset` | Wipe local DB and reapply all migrations |
| `npx supabase db push` | Push pending migrations to linked cloud project |
| `npx supabase studio` | Open Supabase Studio in browser |
