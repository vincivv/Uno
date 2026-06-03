import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType("uno_card_color", ["red", "yellow", "green", "blue", "wild"]);

  pgm.createType("uno_card_value", [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "skip",
    "reverse",
    "draw_two",
    "wild",
    "wild_draw_four",
  ]);

  pgm.createType("uno_card_zone", ["deck", "hand", "discard"]);

  pgm.createTable("cards", {
    id: "id",
    color: {
      type: "uno_card_color",
      notNull: true,
    },
    value: {
      type: "uno_card_value",
      notNull: true,
    },
    points: {
      type: "integer",
      notNull: true,
    },
  });

  pgm.createTable("game_cards", {
    id: "id",
    game_id: {
      type: "integer",
      notNull: true,
      references: "games",
      onDelete: "CASCADE",
    },
    card_id: {
      type: "integer",
      notNull: true,
      references: "cards",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "CASCADE",
    },
    zone: {
      type: "uno_card_zone",
      notNull: true,
    },
    position: {
      type: "integer",
      notNull: true,
    },
  });

  pgm.createTable("uno_game_state", {
    game_id: {
      type: "integer",
      notNull: true,
      primaryKey: true,
      references: "games",
      onDelete: "CASCADE",
    },
    current_user_id: {
      type: "integer",
      references: "users",
      onDelete: "SET NULL",
    },
    current_color: {
      type: "uno_card_color",
    },
    direction: {
      type: "integer",
      notNull: true,
      default: 1,
    },
    draw_stack: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    status: {
      type: "text",
      notNull: true,
      default: "waiting",
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("game_cards", ["game_id", "zone"]);
  pgm.createIndex("game_cards", ["game_id", "user_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("game_cards", ["game_id", "user_id"]);
  pgm.dropIndex("game_cards", ["game_id", "zone"]);

  pgm.dropTable("uno_game_state");
  pgm.dropTable("game_cards");
  pgm.dropTable("cards");

  pgm.dropType("uno_card_zone");
  pgm.dropType("uno_card_value");
  pgm.dropType("uno_card_color");
}