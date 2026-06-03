import { DbUser, User } from "../types/types.js";
import db from "./connections.js";

const existing = async (email: string): Promise<boolean> => {
  const user = await db.oneOrNone<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
  return user !== null;
};

const create = async (email: string, passwordHash: string, avatar: string): Promise<User> =>
  await db.one<User>(
    "INSERT INTO users (email, password_hash, gravatar_url) VALUES ($1, $2, $3) RETURNING id, email, gravatar_url, created_at",
    [email, passwordHash, avatar],
  );

const findByEmail = async (email: string): Promise<DbUser> =>
  await db.one<DbUser>("SELECT * FROM users WHERE email = $1", [email]);

export default { existing, create, findByEmail };
