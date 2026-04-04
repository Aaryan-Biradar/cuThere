import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables for standalone Node.js scripts
dotenv.config({ path: '.env' });

//edited for test ui 
const url = process.env.TURSO_DATABASE_URL;

// Only connect when configured — avoids LibsqlError URL_INVALID at import time if env is missing
const db = url
  ? createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    })
  : null;
//edited for test ui

export default db;
