import type { GameListItem } from "../types/types.js";

const createGameButton = document.querySelector<HTMLButtonElement>("#create-game");
const gamesList = document.querySelector<HTMLDivElement>("#games-list");
const gameTemplate = document.querySelector<HTMLTemplateElement>("#game-template");

async function joinGame(gameId: number): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to join game");
    return;
  }

  window.location.href = `/games/${String(gameId)}`;
}

function renderGames(games: GameListItem[]): void {
  if (!gamesList || !gameTemplate) {
    return;
  }

  gamesList.innerHTML = "";

  if (games.length === 0) {
    gamesList.textContent = "No Uno games created yet. Create one!";
    return;
  }

  games.forEach((game: GameListItem) => {
    const clone = gameTemplate.content.cloneNode(true) as DocumentFragment;

    const gameId = clone.querySelector<HTMLElement>(".game-id");
    const creator = clone.querySelector<HTMLElement>(".creator");
    const players = clone.querySelector<HTMLElement>(".players");
    const status = clone.querySelector<HTMLElement>(".status");
    const joinButton = clone.querySelector<HTMLButtonElement>(".join-game");

    if (gameId) gameId.textContent = `Uno Game #${String(game.id)}`;
    if (creator) creator.textContent = `Created by: ${game.creator_email}`;
    if (players) players.textContent = `${String(game.player_count)} player(s)`;
    if (status) status.textContent = `Status: ${String(game.status)}`;

    joinButton?.addEventListener("click", () => {
      void joinGame(game.id);
    });

    gamesList.appendChild(clone);
  });
}

async function loadGames(): Promise<void> {
  const response = await fetch("/api/games");
  const { games } = (await response.json()) as { games: GameListItem[] };

  renderGames(games);
}

async function createGame(): Promise<void> {
  const response = await fetch("/api/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to create game");
    return;
  }

  const { game } = (await response.json()) as { game: { id: number } };
  window.location.href = `/games/${String(game.id)}`;
}

const source = new EventSource("/api/sse");

source.onmessage = (event): void => {
  const data = JSON.parse(String(event.data)) as {
    type?: string;
    games?: GameListItem[];
  };

  if (data.type === "games_updated" && data.games) {
    renderGames(data.games);
  }
};

createGameButton?.addEventListener("click", () => {
  void createGame();
});

void loadGames();
