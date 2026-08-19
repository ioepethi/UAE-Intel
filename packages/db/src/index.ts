export { openDb, migrate, SCHEMA_SQL } from "./schema.js";
export type { DbConfig } from "./schema.js";
export * as repo from "./repo.js";
export {
  insertSource,
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
