# CityBrain KZ

An AI platform that collects residents' reports about city problems, classifies them automatically and turns them into an interactive incident map with analytics for the city administration (akimat).

Hackathon demo (MVP). End-to-end flow: a resident takes a photo of a problem → AI suggests a category → the incident appears on the map → it is checked for duplicates nearby → it gets a priority score → it shows up on the akimat dashboard.

## Features

- **Incident map** (Leaflet + OpenStreetMap) with filters by category, status, district and period.
- **Report submission**: up to 3 photos, a description, a point on the map or geolocation.
- **AI classification**: category and severity from text and photos. Works without a key (keyword heuristics) and with a key (Claude via `@anthropic-ai/sdk`).
- **Deduplication**: finds similar reports of the same category within 100 m over 30 days and offers to confirm the existing incident.
- **Prioritization**: a score based on confirmations, severity, distance to schools and hospitals, and the age of the report.
- **Gamification and community verification**: badges, an activity rating, residents can confirm and close reports.
- **Akimat dashboard**: statistics by category and status, weekly trends, top districts, SLA, and a table sorted by AI priority with status changes.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Leaflet / react-leaflet · Recharts · Anthropic SDK.

Data is stored in the browser (localStorage) on top of 42 seed incidents in Almaty, so the demo needs no database.

## Run

```bash
npm install
npm run dev
# http://localhost:3000
```

### AI with Claude (optional)

Without a key, classification uses heuristics. To enable Claude, set the environment variable:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

On Vercel, add it in Project → Settings → Environment Variables.
