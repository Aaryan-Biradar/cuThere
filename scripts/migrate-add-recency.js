import db from '../src/lib/server/db.js';

/**
 * Additive, NON-destructive migration for duplicate-event detection.
 * Safe to re-run: ALTERs swallow "duplicate column name", table uses IF NOT EXISTS.
 *
 * Do NOT run scripts/cleanDB.js for this — that drops & rebuilds every table.
 *
 * Run once:  node scripts/migrate-add-recency.js
 */
async function addColumnSafe(sql) {
    try {
        await db.execute(sql);
        console.log(`   ✅ ${sql}`);
    } catch (e) {
        if (/duplicate column name/i.test(e.message)) {
            console.log(`   ⏭️  Already applied, skipping: ${sql}`);
        } else {
            throw e;
        }
    }
}

async function migrate() {
    console.log("🚀 Additive migration: EVENT recency columns...\n");

    // Recency signal: the Instagram post time (ISO string) the latest content came from.
    await addColumnSafe(`ALTER TABLE EVENT ADD COLUMN post_timestamp TEXT`);
    // Set whenever a merge updates the surviving event.
    await addColumnSafe(`ALTER TABLE EVENT ADD COLUMN updated_at TEXT`);

    console.log("\n✅ Migration complete.");
}

migrate().catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
});
