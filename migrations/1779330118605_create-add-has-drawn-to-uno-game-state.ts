import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("uno_game_state", {
    has_drawn: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("uno_game_state", "has_drawn");
}