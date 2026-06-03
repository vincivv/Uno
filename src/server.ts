import express from "express";
import session from "express-session";
import path from "path";

import playRoutes from "./routes/play.js";
import homeRoutes from "./routes/home.js";
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import lobbyRoutes from "./routes/lobby.js";
import gameRoutes from "./routes/games.js";
import expressLayouts from "express-ejs-layouts";
import connectPgSimple from "connect-pg-simple";
import db from "./db/connections.js";
import { configDotenv } from "dotenv";
import { User } from "./types/types.js";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import { requireAuth } from "./middleware/auth.js";
import sseRoutes from "./routes/sse.js";

configDotenv();

const app = express();
app.set("trust proxy", 1);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (process.env.NODE_ENV !== "production") {
  const liveReloadServer = livereload.createServer({ exts: ["ejs", "css", "js"] });
  liveReloadServer.watch([path.join(path.resolve(), "views"), path.join(path.resolve(), "public")]);

  app.use(connectLiveReload());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIX: Point to root views folder
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

app.use(expressLayouts);
app.set("layout", "layout");

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pgPromise: db, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// FIX: Point to root public folder
app.use(express.static(path.join(path.resolve(), "public")));

app.use((request, _response, next) => {
  console.log(`${new Date().toISOString()} ${request.method} ${request.path}`);
  next();
});

app.use("/", homeRoutes);
app.use("/test", testRoutes);
app.use("/auth", authRoutes);
app.use("/lobby", lobbyRoutes);
app.use("/api/sse", requireAuth, sseRoutes);
app.use("/api/games", requireAuth, gameRoutes);
app.use("/games", requireAuth, playRoutes);

app.get("/", (req, res) => {
  res.send(`<h1>Express is listening on port ${String(PORT)}</h1> <p>${typeof req.body}</p>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${String(PORT)}`);
});

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}
