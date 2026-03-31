import path from 'path';
import { fileURLToPath } from 'url';

// Standardized database path (pointing to data/cuthere.db from the root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, '..', '..', 'data', 'cuthere.db');
