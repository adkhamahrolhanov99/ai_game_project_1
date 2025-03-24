// app.js
/*
// Create a starting game state
const root = new GameState({
    number: 24000, // test input
    humanScore: 0,
    computerScore: 0,
    isComputerTurn: false
  });
  
  generateGameTree(root);
  
  // Basic log to verify children were generated
  console.log("Root number:", root.number);
  console.log("Children count:", root.children.length);
  console.log("Example child state:", root.children[0]);
  console.log("First child heuristic value:", root.children[0].heuristicValue);
*/

/*
const root = new GameState({
    number: 24000,
    humanScore: 0,
    computerScore: 0,
    isComputerTurn: true // It's computer's turn now
  });
  
  const bestMove = getBestMove(root, 5);
  
  console.log("Best move chosen by Minimax:");
  console.log("Divided by:", bestMove.move);
  console.log("New number:", bestMove.number);
  console.log("New scores → Human:", bestMove.humanScore, "Computer:", bestMove.computerScore);
  console.log("Heuristic value:", bestMove.heuristicValue);
  
  // Optional: show on page
  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = `
    <h2>Minimax Move</h2>
    <p>Root Number: ${root.number}</p>
    <p>Best Move: /${bestMove.move}</p>
    <p>New Number: ${bestMove.number}</p>
    <p>Scores → Human: ${bestMove.humanScore}, Computer: ${bestMove.computerScore}</p>
    <p>Heuristic Value: ${bestMove.heuristicValue}</p>
  `;
  */


  /*
  const root = new GameState({
    number: 24000,
    humanScore: 0,
    computerScore: 0,
    isComputerTurn: true
  });
  
  const bestMove = getBestMoveAlphaBeta(root, 5);
  
  console.log("Best move chosen by Alpha-Beta:");
  console.log("Divided by:", bestMove.move);
  console.log("New number:", bestMove.number);
  console.log("New scores → Human:", bestMove.humanScore, "Computer:", bestMove.computerScore);
  console.log("Heuristic value:", bestMove.heuristicValue);
  
  const gameArea = document.getElementById("game-area");
  gameArea.innerHTML = `
    <h2>Alpha-Beta Move</h2>
    <p>Root Number: ${root.number}</p>
    <p>Best Move: /${bestMove.move}</p>
    <p>New Number: ${bestMove.number}</p>
    <p>Scores → Human: ${bestMove.humanScore}, Computer: ${bestMove.computerScore}</p>
    <p>Heuristic Value: ${bestMove.heuristicValue}</p>
  `;
  */


// === GLOBAL VARIABLES ===
const moveLogEl = document.getElementById("move-log");
let moveHistory = [];              // Stores move messages
let aiNodesVisited = 0;            // Tracks number of nodes visited per AI move
let aiStartTime = 0;               // Start time for AI move (ms)
let currentState;                  // Holds current game state object

startNewGame(); // Start game on page load

// === UPDATE DISPLAY ===
// Updates number, scores, and turn/status on the page
function updateDisplay() {
  const gameInfo = document.getElementById("game-info");
  const status = document.getElementById("status");

  gameInfo.innerHTML = `
    <p><strong>Current Number:</strong> ${currentState.number}</p>
    <p><strong>Human Score:</strong> ${currentState.humanScore}</p>
    <p><strong>Computer Score:</strong> ${currentState.computerScore}</p>
  `;

  status.innerHTML = currentState.number <= 10
    ? "<strong>Game Over!</strong> " + getResultMessage()
    : currentState.isComputerTurn ? "Computer's Turn..." : "Your Turn";
}

// === GAME RESULT ===
// Returns string: who wins or draw
function getResultMessage() {
  if (currentState.computerScore > currentState.humanScore) return "Computer wins!";
  if (currentState.humanScore > currentState.computerScore) return "You win!";
  return "It's a draw!";
}

// === LOG EACH MOVE TO THE LIST ===
function logMove(actor, divisor, result, humanScore, computerScore) {
  const message = `${actor} divided by ${divisor}, result: ${result} | Human: ${humanScore}, Computer: ${computerScore}`;
  moveHistory.push(message);
  const li = document.createElement("li");
  li.textContent = message;
  moveLogEl.appendChild(li);
}

// === PLAYER MOVE ===
// Handles user interaction for ÷2, ÷3, ÷4
function playerMove(divisor) {
  if (currentState.isComputerTurn || currentState.number <= 10) return;

  // If player can't move
  if (!hasValidMoves(currentState.number)) {
    const testState = new GameState({ ...currentState, isComputerTurn: true });

    if (!hasValidMoves(testState.number)) {
      alert("No valid moves for either player. Ending game.\n\n" + getResultMessage());
      updateDisplay();
      return;
    }

    alert("No valid moves for you. Skipping to computer.");
    currentState.isComputerTurn = true;
    updateDisplay();
    setTimeout(() => computerMove(), 500);
    return;
  }

  // If invalid move (not divisible)
  if (currentState.number % divisor !== 0) {
    alert("Invalid move!");
    return;
  }

  // Make the move
  const newNumber = currentState.number / divisor;
  let newHumanScore = currentState.humanScore;
  let newComputerScore = currentState.computerScore;

  if (newNumber % 2 === 0) {
    newComputerScore = Math.max(0, newComputerScore - 1);
  } else {
    newHumanScore += 1;
  }

  currentState = new GameState({
    number: newNumber,
    humanScore: newHumanScore,
    computerScore: newComputerScore,
    isComputerTurn: true
  });

  logMove("Player", divisor, newNumber, newHumanScore, newComputerScore);
  updateDisplay();
  setTimeout(() => computerMove(), 500);
}

// === COMPUTER MOVE ===
// AI chooses best move based on selected algorithm
function computerMove() {
  console.log("Computer is thinking... 🤖");

  if (!currentState.isComputerTurn || currentState.number <= 10) return;

  // If AI can't move
  if (!hasValidMoves(currentState.number)) {
    const testState = new GameState({ ...currentState, isComputerTurn: false });

    if (!hasValidMoves(testState.number)) {
      alert("No valid moves for either player. Ending game.\n\n" + getResultMessage());
      updateDisplay();
      return;
    }

    console.log("Computer has no valid moves. Skipping to you.");
    currentState.isComputerTurn = false;
    updateDisplay();
    return;
  }

  // Start performance tracking
  const selectedAlgo = document.getElementById("algorithm-select").value;
  aiNodesVisited = 0;
  aiStartTime = performance.now();

  let bestMove;
  if (selectedAlgo === "alphabeta") {
    bestMove = getBestMoveAlphaBeta(currentState, 5);
  } else {
    bestMove = getBestMove(currentState, 5);
  }

  const duration = performance.now() - aiStartTime;
  console.log(`AI (${selectedAlgo}) visited ${aiNodesVisited} nodes in ${duration.toFixed(2)} ms`);

  if (!bestMove) {
    alert("Computer can't move. Game over.");
    return;
  }

  currentState = bestMove;

  logMove("Computer", bestMove.move, bestMove.number, bestMove.humanScore, bestMove.computerScore);
  updateDisplay();
}

// === VALID MOVE CHECKER ===
function hasValidMoves(number) {
  return [2, 3, 4].some(divisor => number % divisor === 0);
}

// === GENERATE RANDOM VALID STARTING NUMBER ===
function getRandomStartNumber() {
  let num;
  do {
    num = Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000;
  } while (num % 2 !== 0 || num % 3 !== 0 || num % 4 !== 0);
  return num;
}

// === RESET GAME ===
function startNewGame() {
  currentState = new GameState({
    number: getRandomStartNumber(),
    humanScore: 0,
    computerScore: 0,
    isComputerTurn: false
  });

  moveHistory = [];
  moveLogEl.innerHTML = "";
  updateDisplay();
}
