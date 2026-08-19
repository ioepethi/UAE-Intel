// Public API for the @uae-intel/db package.
// Runtime-agnostic: callers pass in a DbClient (better-sqlite3 or D1).
// NOTE: openBetterSqlite is NOT exported here to avoid pulling better-sqlite3
// into edge bundles. Import it from "@uae-intel/db/local" instead.

export type { DbClient, Statement, RunResult } from "./client.js";
export { openD1 } from "./d1.js";
export type { BetterSqliteOptions } from "./better-sqlite.js";
export type { D1Like } from "./d1.js";
export { migrate, SCHEMA_SQL } from "./schema.js";
export * as repo from "./repo.js";
export {
  insertSource,
  getSource,
  insertPerson,
  getPerson,
  findPersonsByName,
  insertCompany,
  getCompany,
  findCompaniesByName,
  insertRole,
  rolesForPerson,
  rolesForCompany,
  insertContact,
  contactsForPerson,
  contactsForCompany,
  insertRelationship,
  relationshipsForPerson,
  searchPersons,
} from "./repo.js";
export type { PersonSearchFilters } from "./repo.js";
