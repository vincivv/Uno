import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:gameId", requireAuth, (request, response) => {
  const gameId = Number(request.params.gameId);
  const { user } = request.session;

  if (!Number.isInteger(gameId) || gameId <= 0) {
    response.status(400).send("Invalid game id");
    return;
  }

  response.render("game", {
    user,
    gameId,
  });
});

export default router;
