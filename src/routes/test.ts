import { Router } from "express";
import db from "../db/connections.js";

const router = Router();

router.get("/:id", async (request, response) => {
  const { id } = request.params;

  await db.none("INSERT INTO test_table (message) VALUES ($1)", [
    `Request ${id} at ${new Date().toLocaleTimeString()}`,
  ]);

  response.json(await db.any("SELECT * FROM test_table"));
});

export default router;
