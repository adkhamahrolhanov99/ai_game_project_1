// === Game State Class ===
// Represents each node/state in the game tree
class GameState {
  constructor({
    number,
    humanScore = 0,
    computerScore = 0,
    isComputerTurn = false,
    move = null,
    parent = null
  }) {
    this.number = number;
    this.humanScore = humanScore;
    this.computerScore = computerScore;
    this.isComputerTurn = isComputerTurn;
    this.move = move;
    this.parent = parent;
    this.children = [];
    this.heuristicValue = null;
  }

  // Clone the current state (for branching)
  clone() {
    return new GameState({
      number: this.number,
      humanScore: this.humanScore,
      computerScore: this.computerScore,
      isComputerTurn: this.isComputerTurn,
      move: this.move,
      parent: this.parent
    });
  }
}

// === Heuristic Function ===
// Scores the state from the computer's perspective
function evaluateState(state) {
  return state.computerScore - state.humanScore;
}

// === Generate Game Tree ===
// Recursively expands possible game states up to a max depth
function generateGameTree(node, depth = 0, maxDepth = 5) {
  if (node.number <= 10 || depth >= maxDepth) return;

  [2, 3, 4].forEach(divisor => {
    if (node.number % divisor === 0) {
      const newNumber = node.number / divisor;
      const newNode = node.clone();
      newNode.parent = node;
      newNode.move = divisor;
      newNode.number = newNumber;
      newNode.isComputerTurn = !node.isComputerTurn;

      // Score update rules
      if (newNumber % 2 === 0) {
        if (node.isComputerTurn) {
          newNode.humanScore = Math.max(0, node.humanScore - 1);
          newNode.computerScore = node.computerScore;
        } else {
          newNode.computerScore = Math.max(0, node.computerScore - 1);
          newNode.humanScore = node.humanScore;
        }
      } else {
        if (node.isComputerTurn) {
          newNode.computerScore = node.computerScore + 1;
          newNode.humanScore = node.humanScore;
        } else {
          newNode.humanScore = node.humanScore + 1;
          newNode.computerScore = node.computerScore;
        }
      }

      newNode.heuristicValue = evaluateState(newNode);
      node.children.push(newNode);

      generateGameTree(newNode, depth + 1, maxDepth);
    }
  });
}

// === Minimax Algorithm ===
function minimax(node, depth, isMaximizingPlayer) {
  aiNodesVisited++; // Count visited node

  if (depth === 0 || node.number <= 10 || node.children.length === 0) {
    return evaluateState(node);
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let child of node.children) {
      const eval = minimax(child, depth - 1, false);
      maxEval = Math.max(maxEval, eval);
    }
    node.heuristicValue = maxEval;
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let child of node.children) {
      const eval = minimax(child, depth - 1, true);
      minEval = Math.min(minEval, eval);
    }
    node.heuristicValue = minEval;
    return minEval;
  }
}

// === Alpha-Beta Pruning Algorithm ===
function alphaBeta(node, depth, alpha, beta, isMaximizingPlayer) {
  aiNodesVisited++; // Count visited node

  if (depth === 0 || node.number <= 10 || node.children.length === 0) {
    return evaluateState(node);
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let child of node.children) {
      const eval = alphaBeta(child, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break; // Prune branch
    }
    node.heuristicValue = maxEval;
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let child of node.children) {
      const eval = alphaBeta(child, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break; // Prune branch
    }
    node.heuristicValue = minEval;
    return minEval;
  }
}

// === Wrapper to Get Best Move using Minimax ===
function getBestMove(root, maxDepth = 5) {
  generateGameTree(root, 0, maxDepth);
  minimax(root, maxDepth, true);

  let bestMove = null;
  let bestValue = -Infinity;

  for (let child of root.children) {
    if (child.heuristicValue > bestValue) {
      bestValue = child.heuristicValue;
      bestMove = child;
    }
  }

  return bestMove;
}

// === Wrapper to Get Best Move using Alpha-Beta ===
function getBestMoveAlphaBeta(root, maxDepth = 5) {
  generateGameTree(root, 0, maxDepth);
  alphaBeta(root, maxDepth, -Infinity, Infinity, true);

  let bestMove = null;
  let bestValue = -Infinity;

  for (let child of root.children) {
    if (child.heuristicValue > bestValue) {
      bestValue = child.heuristicValue;
      bestMove = child;
    }
  }

  return bestMove;
}