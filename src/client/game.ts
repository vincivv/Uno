//client/game.ts
interface UnoVisibleCard {
  game_card_id: number;
  card_id: number;
  color: string;
  value: string;
  points: number;
  position: number;
}

interface UnoPlayerState {
  id: number;
  email: string;
  hand_count: number;
}

interface UnoGameStateView {
  game_id: number;
  status: string;
  current_user_id: number | null;
  current_color: string | null;
  direction: number;
  draw_stack: number;
  deck_count: number;
  players: UnoPlayerState[];
  discard_top: UnoVisibleCard | null;
  hand: UnoVisibleCard[];
}

interface GameMessage {
  type?: string;
  state?: UnoGameStateView;
}

let currentGameState: UnoGameStateView | null = null;

const gameIdInput = document.querySelector<HTMLInputElement>("#game-id");
const gameStatus = document.querySelector<HTMLDivElement>("#game-status");
const playersList = document.querySelector<HTMLDivElement>("#players-list");
const discardPile = document.querySelector<HTMLDivElement>("#discard-pile");
const playerHand = document.querySelector<HTMLDivElement>("#player-hand");
const startGameButton = document.querySelector<HTMLButtonElement>("#start-game");
const drawCardButton = document.querySelector<HTMLButtonElement>("#draw-card");
const errorMessage = document.querySelector<HTMLDivElement>("#error-message");
const gameMessage = document.querySelector<HTMLDivElement>("#game-message");

const gameId = gameIdInput ? Number(gameIdInput.value) : 0;

function setText(element: HTMLElement | null, text: string): void {
  if (element) {
    element.textContent = text;
  }
}

function showError(message: string): void {
  if (!errorMessage) {
    return;
  }
  errorMessage.textContent = message;
  setTimeout(() => {
    errorMessage.textContent = "";
  }, 3000);
}

function showMessage(message: string): void {
  setText(gameMessage, message);
}

function formatCard(card: UnoVisibleCard): string {
  return `${card.color} ${card.value}`;
}

function parseGameMessage(rawData: string): GameMessage | null {
  const parsedData = JSON.parse(rawData) as unknown;
  if (typeof parsedData !== "object" || parsedData === null) {
    return null;
  }
  return parsedData as GameMessage;
}

function renderPlayers(players: UnoPlayerState[], currentUserId: number | null): void {
  if (!playersList) {
    return;
  }
  playersList.innerHTML = "";

  for (const player of players) {
    const playerRow = document.createElement("p");
    const turnMarker = currentUserId === player.id ? " ← current turn" : "";
    playerRow.textContent = `${player.email}: ${String(player.hand_count)} card(s)${turnMarker}`;
    playersList.appendChild(playerRow);
  }
}

function renderHand(hand: UnoVisibleCard[]): void {
  if (!playerHand) return;
  playerHand.innerHTML = "";

  if (hand.length === 0) {
    playerHand.textContent = "No cards in your hand.";
    return;
  }

  for (const card of hand) {
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.textContent = formatCard(card);
    cardButton.style.margin = "5px";
    cardButton.style.padding = "10px";

    cardButton.addEventListener("click", () => {
      void playCard(card.game_card_id);
    });

    playerHand.appendChild(cardButton);
  }
}

function renderGameState(state: UnoGameStateView): void {
  currentGameState = state;

  if (state.status === "finished") {
    const winner = state.players.find((player) => player.hand_count === 0);
    setText(gameStatus, `Game Over! Winner: ${winner?.email ?? "Unknown Player"}`);
  } else {
    const colorText = state.current_color ?? "none";
    setText(
      gameStatus,
      `Status: ${state.status}. Color: ${colorText}. Deck: ${String(state.deck_count)}. Stack: ${String(state.draw_stack)}`,
    );
  }

  if (state.discard_top) {
    // Check if the top card is a wild card
    const isWild = state.discard_top.color === "wild";
    // If it's wild, display the color chosen by the player (state.current_color)
    const displayColor = isWild ? (state.current_color ?? "wild") : state.discard_top.color;

    setText(discardPile, `${displayColor} ${state.discard_top.value}`);
  }

  renderPlayers(state.players, state.current_user_id);
  renderHand(state.hand);
}

async function loadGameState(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/state`);
  if (!response.ok) return;
  const { state } = (await response.json()) as { state: UnoGameStateView };
  renderGameState(state);
}

async function startGame(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) showMessage("Failed to start game.");
}

async function drawCard(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/draw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    showError(data.error ?? "Failed to draw card");
    return;
  }
  showMessage("Card(s) drawn.");
}

async function playCard(gameCardId: number): Promise<void> {
  if (!currentGameState) return;

  const card = currentGameState.hand.find((c) => c.game_card_id === gameCardId);
  let chosenColor: string | undefined;

  if (card?.color === "wild") {
    const input = window.prompt("Choose a color: red, blue, green, or yellow");
    if (!input) return;

    const sanitized = input.toLowerCase().trim();
    const validColors = ["red", "blue", "green", "yellow"];

    if (!validColors.includes(sanitized)) {
      showError("Invalid color choice.");
      return;
    }
    chosenColor = sanitized;
  }

  const response = await fetch(`/api/games/${String(gameId)}/play`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameCardId, chosenColor }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { error?: string };
    showError(errorData.error ?? "Invalid play.");
    return;
  }
  showMessage("Card played.");
}

if (Number.isInteger(gameId) && gameId > 0) {
  const source = new EventSource(`/api/sse?gameId=${String(gameId)}`);
  source.onmessage = (event): void => {
    const data = parseGameMessage(String(event.data));
    if (data?.type === "game_updated" && data.state) {
      renderGameState(data.state);
    }
  };
  void loadGameState();
}

startGameButton?.addEventListener("click", () => {
  void startGame();
});
drawCardButton?.addEventListener("click", () => {
  void drawCard();
});
