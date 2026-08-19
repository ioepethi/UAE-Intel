// Standalone migration entrypoint: `npm run db:push` from repo root.
import { openDb, migrate } from "./index.js";

const db = openDb();
migrate(db);
console.log("Database schema applied.");
db.close();
