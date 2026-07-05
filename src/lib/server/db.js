import { createClient } from '@libsql/client';
// Load .env for standalone Node.js scripts (no-op under Next.js, which loads it itself)
import 'dotenv/config';

// Lazily-created Turso client — deferred until first use so importing this
// module at build/CI time (when TURSO_* env vars are absent) never throws.
let _client = null;

function getClient() {
    if (!_client) {
        _client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return _client;
}

// Proxy forwards every property access (execute, batch, …) to the real client,
// binding methods so callers can use `db.execute(...)` unchanged.
const db = new Proxy(
    {},
    {
        get(_target, prop) {
            const client = getClient();
            const value = client[prop];
            return typeof value === 'function' ? value.bind(client) : value;
        },
    }
);

export default db;
