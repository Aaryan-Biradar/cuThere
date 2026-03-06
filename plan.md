cuThere/
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx                      (browse & filter events)
│   │   ├── events/[id]/page.jsx          (event detail + drill-down)
│   │   └── api/
│   │       ├── events/route.js           (GET filtered, POST new)
│   │       ├── events/[id]/route.js      (GET single + related)
│   │       ├── rsvp/route.js             (POST/DELETE RSVP)
│   │       └── scrape/route.js           (Apify → parse → INSERT)
│   ├── components/
│   │   └── EventCard.jsx
│   └── lib/
│       ├── db.js                         (SQLite connection + schema)
│       └── parser.js                     (extract event info from IG text)
├── data/
│   └── cuthere.db
├── .env                                  (APIFY_TOKEN, etc.)
├── readme.txt
└── package.json