import type { Response } from "express";

interface Client {
  id: number;
  response: Response;
  userId?: number;
  gameId?: number;
}

const clients = new Map<number, Client>();
let nextClientId = 0;

function addClient(response: Response, userId?: number, gameId?: number): number {
  const id = nextClientId++;

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  response.write("\n");

  clients.set(id, {
    id,
    response,
    userId,
    gameId,
  });

  return id;
}

function removeClient(id: number): void {
  clients.delete(id);
}

function send(response: Response, payload: unknown): void {
  const message = `data: ${JSON.stringify(payload)}\n\n`;

  response.write(message);
}

function broadcast(payload: unknown): void {
  for (const client of clients.values()) {
    send(client.response, payload);
  }
}

function broadcastToGame(gameId: number, payload: unknown): void {
  for (const client of clients.values()) {
    if (client.gameId === gameId) {
      send(client.response, payload);
    }
  }
}

function broadcastToGameUser(gameId: number, userId: number, payload: unknown): void {
  for (const client of clients.values()) {
    if (client.gameId === gameId && client.userId === userId) {
      send(client.response, payload);
    }
  }
}

export default {
  addClient,
  removeClient,
  broadcast,
  broadcastToGame,
  broadcastToGameUser,
};
