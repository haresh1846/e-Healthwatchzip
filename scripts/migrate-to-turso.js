/**
 * migrate-to-turso.js — one-off copy of the local SQLite database into Turso.
 *
 * Usage (run once, from the project root, on the machine that has the local
 * ehealthwatch.db — e.g. the Replit shell):
 *
 *   TURSO_DATABASE_URL=libsql://<your-db>.turso.io \
 *   TURSO_AUTH_TOKEN=<token> \
 *   node scripts/migrate-to-turso.js [path/to/local.db]
 *
 * Safe to re-run: rows are inserted with INSERT OR IGNORE, so existing rows
 * (matched on primary key / unique columns) are left untouched.
 */

'use strict';

const path = require('path');
const fs = require('fs');

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running this script.');
  process.exit(1);
}

const localPath = process.argv[2] || path.join(__dirname, '..', 'ehealthwatch.db');
if (!fs.existsSync(localPath)) {
  console.error(`Local database not found at ${localPath} — nothing to migrate.`);
  process.exit(1);
}

// Requiring db.js with the TURSO_* env vars set connects to Turso and creates
// the full schema (plus default seed) on it before we copy anything.
const turso = require('../db');
const Database = require('better-sqlite3');
const local = new Database(localPath, { readonly: true });

const TABLES = ['bmdlogin', 'bmd', 'consumers', 'consumer_profiles', 'consumer_orders', 'mp_results_v2'];

(async () => {
  await turso.ready;

  for (const table of TABLES) {
    let rows;
    try {
      rows = local.prepare(`SELECT * FROM ${table}`).all();
    } catch (_) {
      console.log(`- ${table}: not present locally, skipped`);
      continue;
    }
    if (rows.length === 0) {
      console.log(`- ${table}: 0 rows, skipped`);
      continue;
    }
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    await turso.batch(rows.map(r => ({ sql, args: columns.map(c => r[c]) })));
    console.log(`- ${table}: migrated ${rows.length} row(s)`);
  }

  console.log('\nDone. Verify the data in the Turso dashboard (SQL console → SELECT COUNT(*) FROM consumers; etc.)');
  process.exit(0);
})().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
