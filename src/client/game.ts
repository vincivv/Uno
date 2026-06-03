// client/game.ts
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
  uno_safe: boolean;
}

interface UnoGameStateView {
  game_id: number;
  viewer_user_id: number | null;
  status: string;
  current_user_id: number | null;
  current_color: string | null;
  direction: number;
  draw_stack: number;
  has_drawn: boolean;
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
let previousCurrentUserId: number | null = null;

const gameIdInput = document.querySelector<HTMLInputElement>("#game-id");
const gameStatus = document.querySelector<HTMLDivElement>("#game-status");
const playersList = document.querySelector<HTMLDivElement>("#players-list");
const discardPile = document.querySelector<HTMLDivElement>("#discard-pile");
const playerHand = document.querySelector<HTMLDivElement>("#player-hand");
const opponentHand = document.querySelector<HTMLDivElement>("#opponent-hand");
const opponentInfoPanel = document.querySelector<HTMLDivElement>("#opponent-info-panel");
const localPlayerLabel = document.querySelector<HTMLDivElement>("#local-player-label");
const drawDeck = document.querySelector<HTMLDivElement>("#draw-deck");
const startGameButton = document.querySelector<HTMLButtonElement>("#start-game");
const drawCardButton = document.querySelector<HTMLButtonElement>("#draw-card");
const endTurnButton = document.querySelector<HTMLButtonElement>("#end-turn");
const errorMessage = document.querySelector<HTMLDivElement>("#error-message");
const gameMessage = document.querySelector<HTMLDivElement>("#game-message");
const shoutUnoButton = document.querySelector<HTMLButtonElement>("#shout-uno");
const catchUnoButton = document.querySelector<HTMLButtonElement>("#catch-uno");

const gameId = gameIdInput ? Number(gameIdInput.value) : 0;

function setText(element: HTMLElement | null, text: string): void {
  if (element) {
    element.textContent = text;
  }
}

let errorTimeoutId: number | null = null;

function showError(message: string): void {
  if (!errorMessage) {
    console.error(message);
    return;
  }

  errorMessage.textContent = message;
  errorMessage.classList.add("visible");

  if (errorTimeoutId !== null) {
    window.clearTimeout(errorTimeoutId);
  }

  errorTimeoutId = window.setTimeout(() => {
    errorMessage.textContent = "";
    errorMessage.classList.remove("visible");
    errorTimeoutId = null;
  }, 3000);
}

function showMessage(message: string): void {
  setText(gameMessage, message);
}

function isViewerTurn(): boolean {
  return (
    currentGameState !== null &&
    currentGameState.current_user_id === currentGameState.viewer_user_id
  );
}

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function prettyCardValue(value: string): string {
  switch (value) {
    case "draw_two":
      return "Draw Two";
    case "wild_draw_four":
      return "Wild Draw Four";
    default:
      return value
        .split("_")
        .map((part) => titleCase(part))
        .join(" ");
  }
}

function cardImagePath(card: Pick<UnoVisibleCard, "color" | "value">): string {
  const filename = `${card.color}-${card.value.replaceAll("_", "-")}.svg`;
  return `/images/cards/${filename}`;
}

function createCardImage(card: Pick<UnoVisibleCard, "color" | "value">, alt: string): HTMLImageElement {
  const image = document.createElement("img");
  image.src = cardImagePath(card);
  image.alt = alt;
  image.className = "uno-card-image";
  image.draggable = false;
  return image;
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
    const playerRow = document.createElement("div");
    playerRow.className = "hud-player-item";

    if (currentUserId === player.id) {
      playerRow.classList.add("active-turn-row");
    }

    const playerName = document.createElement("span");
    const turnMarker = currentUserId === player.id ? "Current turn" : "";
    const unoMarker =
      player.hand_count === 1 ? (player.uno_safe ? "UNO safe" : "UNO vulnerable") : "";

    playerName.textContent = `${player.email} • ${String(player.hand_count)} card(s)`;

    const badges = document.createElement("div");
    badges.className = "hud-player-badges";

    if (unoMarker) {
      const unoBadge = document.createElement("span");
      unoBadge.className = `status-badge ${player.uno_safe ? "safe" : "warning"}`;
      unoBadge.textContent = unoMarker;
      badges.appendChild(unoBadge);
    }

    if (turnMarker) {
      const turnBadge = document.createElement("span");
      turnBadge.className = "turn-badge";
      turnBadge.textContent = turnMarker;
      badges.appendChild(turnBadge);
    }

    playerRow.appendChild(playerName);
    playerRow.appendChild(badges);
    playersList.appendChild(playerRow);
  }
}

function renderHand(hand: UnoVisibleCard[]): void {
  if (!playerHand) {
    return;
  }

  playerHand.innerHTML = "";

  if (hand.length === 0) {
    playerHand.textContent = "No cards in your hand.";
    return;
  }

  for (const card of hand) {
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = "hand-card-button";
    cardButton.title = `${titleCase(card.color)} ${prettyCardValue(card.value)}`;
    cardButton.appendChild(createCardImage(card, cardButton.title));

    cardButton.addEventListener("click", () => {
      void playCard(card.game_card_id);
    });

    playerHand.appendChild(cardButton);
  }
}

function renderOpponentHand(state: UnoGameStateView): void {
  if (!opponentHand || !opponentInfoPanel) {
    return;
  }

  const opponents = state.players.filter((player) => player.id !== state.viewer_user_id);

  opponentHand.innerHTML = "";

  if (opponents.length === 0) {
    opponentInfoPanel.textContent = "Waiting for opponents...";
    return;
  }

  const totalCards = opponents.reduce((sum, player) => sum + player.hand_count, 0);
  opponentInfoPanel.textContent = `${String(opponents.length)} opponent(s) • ${String(totalCards)} card(s) in play`;

  for (const player of opponents) {
    const stack = document.createElement("div");
    stack.className = "opponent-stack";
    stack.title = `${player.email}: ${String(player.hand_count)} cards`;

    const count = Math.min(player.hand_count, 10);

    for (let index = 0; index < count; index += 1) {
      const cardBack = document.createElement("img");
      cardBack.src = "/images/cards/back.svg";
      cardBack.alt = "";
      cardBack.className = "opponent-card-image";
      cardBack.style.setProperty("--stack-offset", `${String(index * 16)}px`);
      stack.appendChild(cardBack);
    }

    const label = document.createElement("div");
    label.className = "opponent-stack-label";
    label.textContent = `${player.email} • ${String(player.hand_count)}`;
    stack.appendChild(label);

    opponentHand.appendChild(stack);
  }
}

function isMyTurn(state: UnoGameStateView): boolean {
  return state.current_user_id === state.viewer_user_id;
}

function shouldHighlightEndTurn(state: UnoGameStateView): boolean {
  return isMyTurn(state) && state.has_drawn && state.draw_stack === 0;
}

function shouldHighlightDrawCard(state: UnoGameStateView): boolean {
  return isMyTurn(state) && state.draw_stack > 0;
}

function didBecomeMyTurn(state: UnoGameStateView): boolean {
  return (
    previousCurrentUserId !== null &&
    previousCurrentUserId !== state.current_user_id &&
    isMyTurn(state) &&
    state.status === "active"
  );
}

function updateActionHighlights(state: UnoGameStateView): void {
  endTurnButton?.classList.toggle("needs-attention", shouldHighlightEndTurn(state));
  playerHand?.classList.toggle("needs-end-turn", shouldHighlightEndTurn(state));
  drawCardButton?.classList.toggle("needs-attention", shouldHighlightDrawCard(state));
}

function updateTurnMessage(state: UnoGameStateView, becameMyTurn: boolean): void {
  if (state.draw_stack > 0 && isMyTurn(state)) {
    showMessage(`You must draw ${String(state.draw_stack)} card(s).`);
    return;
  }

  if (becameMyTurn) {
    showMessage("Your turn.");
    return;
  }

  if (state.has_drawn && state.draw_stack === 0 && !isMyTurn(state)) {
    showMessage("Current player drew a card.");
  }
}

function renderStatus(state: UnoGameStateView): void {
  if (state.status === "finished") {
    const winner = state.players.find((player) => player.hand_count === 0);

    setText(gameStatus, `Game Over! Winner: ${winner?.email ?? "Unknown Player"}`);
    return;
  }

  const colorText = state.current_color ?? "none";

  setText(
    gameStatus,
    `Status: ${titleCase(state.status)} • Current color: ${titleCase(colorText)} • Draw deck: ${String(
      state.deck_count,
    )} • Penalty stack: ${String(state.draw_stack)} • Drew this turn: ${state.has_drawn ? "Yes" : "No"}`,
  );
}

function renderDiscard(state: UnoGameStateView): void {
  if (!state.discard_top) {
    if (discardPile) {
      discardPile.innerHTML = '<div class="discard-placeholder">Empty</div>';
    }
    return;
  }

  if (!discardPile) {
    return;
  }

  discardPile.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "discard-card-stack";

  const image = createCardImage(
    state.discard_top,
    `${titleCase(state.discard_top.color)} ${prettyCardValue(state.discard_top.value)}`,
  );

  wrapper.appendChild(image);

  if (state.current_color) {
    const chip = document.createElement("div");
    chip.className = `current-color-chip ${state.current_color}`;
    chip.textContent = `Current color: ${titleCase(state.current_color)}`;
    wrapper.appendChild(chip);
  }

  discardPile.appendChild(wrapper);
}

function renderDeck(state: UnoGameStateView): void {
  if (!drawDeck) {
    return;
  }

  drawDeck.innerHTML = "";

  const image = document.createElement("img");
  image.src = "/images/cards/back.svg";
  image.alt = `Draw deck with ${String(state.deck_count)} card(s) remaining`;
  image.className = "uno-card-image";

  const countBadge = document.createElement("div");
  countBadge.className = "deck-count-badge";
  countBadge.textContent = String(state.deck_count);

  drawDeck.appendChild(image);
  drawDeck.appendChild(countBadge);
}

function renderPlayerLabels(state: UnoGameStateView): void {
  if (localPlayerLabel) {
    localPlayerLabel.textContent = `YOUR HAND • ${String(state.hand.length)} card(s)`;
    localPlayerLabel.classList.toggle("active-turn-glow", isMyTurn(state));
  }

  if (opponentInfoPanel) {
    opponentInfoPanel.classList.toggle("active-turn-glow", !isMyTurn(state) && state.status === "active");
  }
}

function renderGameState(state: UnoGameStateView): void {
  const becameMyTurn = didBecomeMyTurn(state);

  currentGameState = state;

  renderStatus(state);
  renderDiscard(state);
  renderPlayers(state.players, state.current_user_id);
  renderHand(state.hand);
  renderOpponentHand(state);
  renderDeck(state);
  renderPlayerLabels(state);

  updateActionHighlights(state);
  updateTurnMessage(state, becameMyTurn);

  previousCurrentUserId = state.current_user_id;
}

async function loadGameState(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/state`);

  if (!response.ok) {
    return;
  }

  const { state } = (await response.json()) as { state: UnoGameStateView };

  renderGameState(state);
}

async function startGame(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    showMessage("Failed to start game.");
  }
}

async function drawCard(): Promise<void> {
  if (!isViewerTurn()) {
    showError("It's not your turn.");
    return;
  }

  const wasPenaltyDraw = currentGameState !== null && currentGameState.draw_stack > 0;

  const response = await fetch(`/api/games/${String(gameId)}/draw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };

    showError(data.error ?? "Failed to draw card");
    return;
  }

  if (wasPenaltyDraw) {
    showMessage("Penalty cards drawn. Turn passed.");
    return;
  }

  showMessage("You drew a card. Play it if possible, or click End Turn.");
}

async function endTurn(): Promise<void> {
  if (!isViewerTurn()) {
    showError("It's not your turn.");
    return;
  }

  const response = await fetch(`/api/games/${String(gameId)}/end-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };

    showError(data.error ?? "Failed to end turn");
    return;
  }

  showMessage("Turn ended.");
}

async function playCard(gameCardId: number): Promise<void> {
  if (!currentGameState) {
    showError("Game state is still loading.");
    return;
  }

  if (!isViewerTurn()) {
    showError("It's not your turn.");
    return;
  }

  const card = currentGameState.hand.find((currentCard) => currentCard.game_card_id === gameCardId);
  let chosenColor: string | undefined;

  if (card?.color === "wild") {
    const input = window.prompt("Choose a color: red, blue, green, or yellow");

    if (!input) {
      return;
    }

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

async function shoutUno(): Promise<void> {
  if (!currentGameState) {
    showError("Game state is still loading.");
    return;
  }

  if (currentGameState.hand.length !== 1) {
    showError("You can only shout UNO when you have one card.");
    return;
  }

  const response = await fetch(`/api/games/${String(gameId)}/shout-uno`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };

    showError(data.error ?? "Failed to shout UNO");
    return;
  }

  showMessage("UNO shouted!");
}

async function catchUno(): Promise<void> {
  const response = await fetch(`/api/games/${String(gameId)}/catch-uno`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };

    showError(data.error ?? "Failed to catch UNO");
    return;
  }

  showMessage("UNO caught!");
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

endTurnButton?.addEventListener("click", () => {
  void endTurn();
});

shoutUnoButton?.addEventListener("click", () => {
  void shoutUno();
});

catchUnoButton?.addEventListener("click", () => {
  void catchUno();
});
