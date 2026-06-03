import { Router } from "express";
import Games from "../db/games.js";
import Uno from "../db/uno.js";
import SSE from "../sse.js";
import { TypedRequestBody } from "../types/types.js";

const router = Router();

interface PlayCardRequestBody {
  gameCardId: number;
  chosenColor?: string; // NEW: Added optional chosenColor property
}

async function broadcastGameState(gameId: number): Promise<void> {
  const players = await Uno.getPlayersForGame(gameId);

  for (const player of players) {
    const state = await Uno.getUnoGameState(gameId, player.id);

    SSE.broadcastToGameUser(gameId, player.id, {
      type: "game_updated",
      state,
    });
  }
}

router.get("/", async (_request, response) => {
  const games = await Games.list();

  response.json({ games });
});

router.get("/:gameId/state", async (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const gameId = Number(request.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    response.status(400).json({ error: "Invalid game id" });
    return;
  }

  try {
    const state = await Uno.getUnoGameState(gameId, user.id);

    response.status(200).json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load game state";

    response.status(400).json({ error: message });
  }
});

router.post("/", async (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = user.id;
  const game = await Games.create(userId);

  const games = await Games.list();

  SSE.broadcast({
    type: "games_updated",
    games,
  });

  response.status(201).json({ game });
});

router.post("/:gameId/join", async (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const gameId = Number(request.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    response.status(400).json({ error: "Invalid game id" });
    return;
  }

  await Games.join(gameId, user.id);
  await broadcastGameState(gameId);

  const games = await Games.list();

  SSE.broadcast({
    type: "games_updated",
    games,
  });

  response.status(200).json({ success: true });
});

router.post("/:gameId/start", async (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const gameId = Number(request.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    response.status(400).json({ error: "Invalid game id" });
    return;
  }

  try {
    const state = await Uno.startGame(gameId);
    await broadcastGameState(gameId);

    const games = await Games.list();

    SSE.broadcast({
      type: "games_updated",
      games,
    });

    response.status(200).json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start game";

    response.status(400).json({ error: message });
  }
});

router.post("/:gameId/play", async (request: TypedRequestBody<PlayCardRequestBody>, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const gameId = Number(request.params.gameId);
  const gameCardId = request.body.gameCardId;
  const chosenColor = request.body.chosenColor; // NEW: Grab the color

  if (
    !Number.isInteger(gameId) ||
    gameId <= 0 ||
    !Number.isInteger(gameCardId) ||
    gameCardId <= 0
  ) {
    response.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    // NEW: Pass chosenColor to the database function
    const state = await Uno.playCard(gameId, user.id, gameCardId, chosenColor);
    await broadcastGameState(gameId);
    response.status(200).json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to play card";

    response.status(400).json({ error: message });
  }
});

router.post("/:gameId/draw", async (request, response) => {
  const user = request.session.user;

  if (!user) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const gameId = Number(request.params.gameId);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    response.status(400).json({ error: "Invalid game id" });
    return;
  }

  try {
    const state = await Uno.drawCard(gameId, user.id);

    await broadcastGameState(gameId);

    response.status(200).json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to draw card";

    response.status(400).json({ error: message });
  }
});

export default router;
