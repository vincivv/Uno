import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    INSERT INTO cards (color, value, points) VALUES

    -- Red cards
    ('red', '0', 0),
    ('red', '1', 1), ('red', '1', 1),
    ('red', '2', 2), ('red', '2', 2),
    ('red', '3', 3), ('red', '3', 3),
    ('red', '4', 4), ('red', '4', 4),
    ('red', '5', 5), ('red', '5', 5),
    ('red', '6', 6), ('red', '6', 6),
    ('red', '7', 7), ('red', '7', 7),
    ('red', '8', 8), ('red', '8', 8),
    ('red', '9', 9), ('red', '9', 9),
    ('red', 'skip', 20), ('red', 'skip', 20),
    ('red', 'reverse', 20), ('red', 'reverse', 20),
    ('red', 'draw_two', 20), ('red', 'draw_two', 20),

    -- Yellow cards
    ('yellow', '0', 0),
    ('yellow', '1', 1), ('yellow', '1', 1),
    ('yellow', '2', 2), ('yellow', '2', 2),
    ('yellow', '3', 3), ('yellow', '3', 3),
    ('yellow', '4', 4), ('yellow', '4', 4),
    ('yellow', '5', 5), ('yellow', '5', 5),
    ('yellow', '6', 6), ('yellow', '6', 6),
    ('yellow', '7', 7), ('yellow', '7', 7),
    ('yellow', '8', 8), ('yellow', '8', 8),
    ('yellow', '9', 9), ('yellow', '9', 9),
    ('yellow', 'skip', 20), ('yellow', 'skip', 20),
    ('yellow', 'reverse', 20), ('yellow', 'reverse', 20),
    ('yellow', 'draw_two', 20), ('yellow', 'draw_two', 20),

    -- Green cards
    ('green', '0', 0),
    ('green', '1', 1), ('green', '1', 1),
    ('green', '2', 2), ('green', '2', 2),
    ('green', '3', 3), ('green', '3', 3),
    ('green', '4', 4), ('green', '4', 4),
    ('green', '5', 5), ('green', '5', 5),
    ('green', '6', 6), ('green', '6', 6),
    ('green', '7', 7), ('green', '7', 7),
    ('green', '8', 8), ('green', '8', 8),
    ('green', '9', 9), ('green', '9', 9),
    ('green', 'skip', 20), ('green', 'skip', 20),
    ('green', 'reverse', 20), ('green', 'reverse', 20),
    ('green', 'draw_two', 20), ('green', 'draw_two', 20),

    -- Blue cards
    ('blue', '0', 0),
    ('blue', '1', 1), ('blue', '1', 1),
    ('blue', '2', 2), ('blue', '2', 2),
    ('blue', '3', 3), ('blue', '3', 3),
    ('blue', '4', 4), ('blue', '4', 4),
    ('blue', '5', 5), ('blue', '5', 5),
    ('blue', '6', 6), ('blue', '6', 6),
    ('blue', '7', 7), ('blue', '7', 7),
    ('blue', '8', 8), ('blue', '8', 8),
    ('blue', '9', 9), ('blue', '9', 9),
    ('blue', 'skip', 20), ('blue', 'skip', 20),
    ('blue', 'reverse', 20), ('blue', 'reverse', 20),
    ('blue', 'draw_two', 20), ('blue', 'draw_two', 20),

    -- Wild cards
    ('wild', 'wild', 50),
    ('wild', 'wild', 50),
    ('wild', 'wild', 50),
    ('wild', 'wild', 50),
    ('wild', 'wild_draw_four', 50),
    ('wild', 'wild_draw_four', 50),
    ('wild', 'wild_draw_four', 50),
    ('wild', 'wild_draw_four', 50);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql("DELETE FROM cards;");
}