import { create } from 'domain';
import { MigrationBuilder } from 'node-pg-migrate';


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createType("game_status", ["waiting", "started", "ended"]);

    pgm.createTable("games", {
        id:"id",
        status: {
            type: "game_status",
            notNull: true,
            default: "waiting"
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        }
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("games");

    pgm.dropType("game_status");
}
