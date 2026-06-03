import { Router } from "express";
import SSE from "../sse.js";

const router = Router();

router.get("/", (request, response) => {
  const user = request.session.user;
  const userId = user?.id;

  const rawGameId = request.query.gameId;
  const gameId = typeof rawGameId === "string" ? Number(rawGameId) : undefined;
  const validGameId = gameId && Number.isInteger(gameId) && gameId > 0 ? gameId : undefined;

  const clientId = SSE.addClient(response, userId, validGameId);

  request.on("close", () => {
    SSE.removeClient(clientId);
  });
});

export default router;
