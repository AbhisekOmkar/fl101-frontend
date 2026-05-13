# fl101 Critic Agent — Frontend

Next.js 14 app for the fl101 Critic Agent. Submit a brief, draft, or code snippet and get rubric scores, gaps, and the single next-best step.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** (zinc base, **emerald accent — no purple anywhere**).

Companion backend lives in `../fl101-backend`.

---

## Quickstart

```bash
cp .env.example .env.local    # point NEXT_PUBLIC_API_URL at the backend (default: http://localhost:8000)
npm install
npm run dev
```

Open `http://localhost:3000`.

### Docker

```bash
docker build -t fl101-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8000 fl101-frontend
```

---

## Pages

| Route        | What it does                                                             |
|--------------|--------------------------------------------------------------------------|
| `/`          | Dashboard: stats, backend health, recent evaluations                     |
| `/evaluate`  | The main flow: pick artifact type, paste content, see results            |
| `/history`   | Past evaluations (in-memory, this session)                               |
| `/eval`      | Run the backend's eval harness against the golden set; see MAE & recall  |

---

## Layout

```
app/
├── layout.tsx           # Root layout: sidebar + main area, Inter + JetBrains Mono
├── globals.css          # Tailwind + theme tokens (zinc base, emerald accent)
├── page.tsx             # Dashboard home
├── evaluate/page.tsx    # Submit + results
├── history/page.tsx     # List + viewer
└── eval/page.tsx        # Eval harness UI

components/
├── ui/                  # shadcn primitives (button, card, input, select, progress, …)
├── layout/              # Sidebar, Header
├── evaluator/           # ArtifactInput, ScoreRing, DimensionScores, GapsList, FeedbackPanel, NextStepCard, StepIndicator, ResultsPanel, ErrorAlert
└── dashboard/           # StatsCards

lib/
├── api.ts               # fetch wrapper around the backend
├── types.ts             # Mirrors backend Pydantic models
└── utils.ts             # cn(), formatDate, scoreColor, severityColor
```

---

## Design notes

- **shadcn/ui** with `baseColor: "zinc"` (see `components.json`).
- **Primary** = slate-900. **Accent** = emerald-500 — chosen for a "growth / learning" vibe and to keep the surface calm.
- **No purple** anywhere — explicit product directive.
- Inter for prose, JetBrains Mono for code/scores.
- The **NextStepCard** is the visual hero on the results view. The product's punchline is "one action you can do in under an hour."
- The `StepIndicator` shows a faux multi-stage pipeline ("Guarding → Scoring → Aggregating → Picking next-best step") while the (non-streaming) backend works. It makes the system feel like a system, not a black box.
- All API errors surface with a stable `error_code` and a suggested follow-up (e.g. `ARTIFACT_TYPE_MISMATCH` shows the type the guard agent thinks was submitted).

---

## Environment

| Name | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL of the fl101 backend |

---

## Conventions

- TypeScript strict mode on.
- Server components by default; client components only where state is needed.
- No `any` (linted).
- `cn()` for class merging, `lucide-react` for icons.

---

## What's not here

- Auth, multi-user state, server-side caching of evaluations — kept in-memory in the backend for the take-home.
- Streaming output — the backend is non-streaming; `StepIndicator` simulates progress.
- Mobile-first nav — sidebar is desktop-first; mobile collapses to the main content (acceptable for the take-home demo).

---

## License

MIT — for assessment use.
