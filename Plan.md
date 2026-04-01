# cuThere — Project Structure

## File Tree

```
cuThere/
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx                          (browse & filter events)
│   │   ├── events/[id]/page.jsx              (event detail + drill-down)
│   │
│   ├── components/
│   │   ├── EventCard.jsx
│   │   └── EventModal.jsx
│   │
│   └── lib/
│       ├── db.js                             (better-sqlite3 connection + full 3NF schema init)
│       ├── scraper.js                        (Apify client — fetch latest IG posts)
│       ├── ai.js                             (Gemini: isEvent filter + analyzeFlyer extraction)
│       ├── eventInsert.js                    (insert event + link hosts & tags into DB)
│       └── pipeline.js                       (orchestrates: scrape → filter → analyze → insert)
│
├── scripts/
│   └── seed-db.js                            (drop & rebuild all tables, seed categories)
│
├── data/
│   └── cuthere.db                            (SQLite database file — gitignored)
│
├── .env                                      (APIFY_API_TOKEN, GEMINI_API_KEY)
├── .gitignore
├── package.json
└── README.md
```

## Where BackEnd/ Files Move To

| BackEnd/ (prototype)  | → Destination in Next.js          | Notes                                                    |
| --------------------- | --------------------------------- | -------------------------------------------------------- |
| `scrapper.js`         | `src/lib/scraper.js`              | Rename (fix typo). Same Apify logic, export only.        |
| `ai.js`               | `src/lib/ai.js`                   | Direct move. Keep `isEvent` + `analyzeFlyer` exports.    |
| `eventInsert.js`      | `src/lib/eventInsert.js`          | Swap `sqlite3`/`sqlite` → `better-sqlite3` (sync API).  |
| `main.js`             | `src/lib/pipeline.js`             | Rename. Convert to an exported `runPipeline(db)` fn.     |
| `cleanDB.js`          | `scripts/seed-db.js`             | One-off script, not a lib. Run with `node scripts/seed-db.js`. |
| `cuthere.db`          | ❌ Delete from BackEnd/           | Prototype DB — the real one lives in `data/cuthere.db`.  |

## Key Changes When Migrating

### 1. `src/lib/db.js` — Upgrade Schema to 3NF
The current `db.js` has a flat `events` + `rsvps` schema. Replace it with the full 3NF schema from `cleanDB.js`:

- **STUDENT** — user accounts
- **ORGANIZATION** — clubs/orgs (keyed by IG username)
- **EVENT** — core event data (keyed by IG post ID)
- **EVENT_HOSTS** — many-to-many junction (event ↔ orgs)
- **CATEGORY** — curated tag list (seeded on first run)
- **EVENT_TAGS** — many-to-many junction (event ↔ categories)
- **RSVP** — student ↔ event attendance
- **STUDENT_FOLLOWS** — student ↔ category subscriptions

### 2. `src/lib/eventInsert.js` — Swap SQLite Driver
BackEnd used async `sqlite3`/`sqlite` wrapper. Next.js uses synchronous `better-sqlite3`.
- `db.run(sql, params)` → `db.prepare(sql).run(...params)`
- `db.get(sql, params)` → `db.prepare(sql).get(...params)`
- No more `await` on DB calls

### 3. `src/lib/pipeline.js` — Accept DB Instance
Instead of opening its own connection, `runPipeline(db)` should accept the `better-sqlite3` instance from `db.js`, so the API route can pass it in.

### 4. `src/app/api/scrape/route.js` — Trigger the Pipeline
```js
import { getDb } from '@/lib/db';
import { runPipeline } from '@/lib/pipeline';

export async function POST() {
    const db = getDb();
    const results = await runPipeline(db);
    return Response.json(results);
}
```

### 5. `scripts/seed-db.js` — Standalone Script
This is the `cleanDB.js` logic adapted for `better-sqlite3`. Run it manually:
```bash
node scripts/seed-db.js
```
Add a convenience script in `package.json`:
```json
"scripts": {
    "seed": "node scripts/seed-db.js"
}
```

## Environment Variables Needed

```env
APIFY_API_TOKEN=your_apify_token
GEMINI_API_KEY=your_gemini_key
```

## Notes
- The `BackEnd/` folder can be deleted once migration is complete
- Fix the scraper typo: `scrapper.js` → `scraper.js`
- The `masterTags` list in `ai.js` should stay in sync with the seed categories in `seed-db.js` — consider extracting to a shared constant in `src/lib/constants.js` if they drift
- Find a better method to verify an event (original note preserved)
- Standerize the input from gemini (ex: event_date, sometimes says Monday Jan 1st, but I just want 1st)
- change the event names to be display names not ig handle
- search doenst have to be through SQL