import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables for standalone Node.js scripts
dotenv.config({ path: '.env' });

// Shared Turso client (serverless SQLite) — reused across all API routes
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;
