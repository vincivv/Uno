import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'session'
          AND column_name = 'id'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'session'
          AND column_name = 'sid'
      ) THEN
        ALTER TABLE "session" RENAME COLUMN "id" TO "sid";
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'session'
          AND column_name = 'sid'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'session'
          AND column_name = 'id'
      ) THEN
        ALTER TABLE "session" RENAME COLUMN "sid" TO "id";
      END IF;
    END
    $$;
  `);
}
