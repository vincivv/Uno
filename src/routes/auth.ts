import { Router } from "express";
import crypto from "crypto";
import Users from "../db/users.js";
import bcrypt from "bcrypt";
import { TypedRequestBody, UserLoginRequestBody } from "../types/types.js";

const router = Router();
const SALT_ROUNDS = 10;

function gravatarURL(email: string): string {
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

// --- GET ROUTES ---

router.get("/register", (_request, response) => {
  // FIX: Added auth/ prefix
  response.render("auth/register", { error: null });
});

router.get("/login", (_request, response) => {
  // FIX: Added auth/ prefix
  response.render("auth/login", { error: null });
});

// --- POST ROUTES ---

router.post("/register", async (request: TypedRequestBody<UserLoginRequestBody>, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.render("auth/register", { error: "Email and password required" });
    return;
  }

  if (password.length < 8) {
    response.render("auth/register", { error: "Password must be at least 8 characters" });
    return;
  }

  try {
    if (await Users.existing(email)) {
      response.render("auth/register", { error: "Email is already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatar = gravatarURL(email);
    const user = await Users.create(email, passwordHash, avatar);

    request.session.user = user;
    response.redirect("/lobby");
  } catch (error) {
    console.error("Registration error:", error);
    response.render("auth/register", { error: "Registration failed" });
  }
});

router.post("/login", async (request: TypedRequestBody<UserLoginRequestBody>, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.render("auth/login", { error: "Email and password required" });
    return;
  }

  try {
    const dbUser = await Users.findByEmail(email);
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!isMatch) {
      response.render("auth/login", { error: "Invalid email or password" });
      return;
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      gravatar_url: dbUser.gravatar_url,
      created_at: dbUser.created_at,
    };

    request.session.user = user;
    response.redirect("/lobby");
  } catch (error) {
    console.error("Login error:", error);
    response.render("auth/login", { error: "Invalid email or password" });
  }
});

router.post("/logout", (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      console.error("Logout Error:", error);
    }
    response.clearCookie("connect.sid");
    response.redirect("/auth/login");
  });
});

export default router;
