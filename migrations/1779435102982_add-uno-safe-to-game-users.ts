import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE game_users
    ADD COLUMN IF NOT EXISTS uno_safe BOOLEAN NOT NULL DEFAULT FALSE;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE game_users
    DROP COLUMN IF EXISTS uno_safe;
  `);
}