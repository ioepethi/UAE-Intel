// Standalone migration entrypoint: `npm run db:push` from repo root.
// Applies the schema to the local SQLite database.
import { openBetterSqlite, migrate } from "./local.js";

const db = openBetterSqlite();
await migrate(db);
console.log("Local database schema applied.");
