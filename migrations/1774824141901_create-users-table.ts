import { MigrationBuilder, PgType } from 'node-pg-migrate';


export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("users", {
        id: "id",
        email: { type: `${PgType.VARCHAR}(255)`, notNull: true, unique: true},
        password_hash: { type: `${PgType.VARCHAR}(255)`, notNull: true},
        gravatar_url: { type: PgType. TEXT},
        created_at: {
            type: PgType.TIMESTAMP,
            default: pgm.func("CURRENT_TIMESTAMP")
        }
    });
}


export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("users");
}
