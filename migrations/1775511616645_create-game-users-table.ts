import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("game_users", {
        game_id: {
            type: "integer",
            notNull: true,
            references: "games",
            onDelete: "CASCADE"
        },
        user_id: {
            type: "integer",
            notNull: true,
            references: "users",
            onDelete: "CASCADE"
        },
        joined_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        }
    });

    pgm.addConstraint("game_users", "game_users_pkey", {
        primaryKey: ["game_id", "user_id"]
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("game_users");
}
