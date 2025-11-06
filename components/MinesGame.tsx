'use client';

import { useState } from 'react';
import { Tile, MinesGameState, MinesPrize, TileState } from '@/types/mines';
import { calculateMultiplier, getPrizeForMultiplier } from '@/lib/mines/prizes';
import { Button } from '@/components/ui/button';

interface MinesGameProps {
  minesCount: number;
  onGameEnd: (won: boolean, prize: MinesPrize | null, multiplier: number) => void;
  canPlay: boolean;
}

export function MinesGame({ minesCount, onGameEnd, canPlay }: MinesGameProps) {
  const [gameState, setGameState] = useState<MinesGameState>({
    tiles: [],
    minesCount,
    revealedCount: 0,
    gameStatus: 'idle',
    currentMultiplier: 1.0,
    prize: null,
  });

  // Initialize game board
  const initializeGame = () => {
    const totalTiles = 25;
    const tiles: Tile[] = [];

    // Create array of mine positions
    const minePositions = new Set<number>();
    while (minePositions.size < minesCount) {
      const pos = Math.floor(Math.random() * totalTiles);
      minePositions.add(pos);
    }

    // Create tiles
    for (let i = 0; i < totalTiles; i++) {
      tiles.push({
        id: i,
        state: 'hidden',
        isMine: minePositions.has(i),
      });
    }

    setGameState({
      tiles,
      minesCount,
      revealedCount: 0,
      gameStatus: 'playing',
      currentMultiplier: 1.0,
      prize: null,
    });
  };

  // Handle tile click
  const handleTileClick = (tileId: number) => {
    if (!canPlay || gameState.gameStatus !== 'playing') return;

    const tile = gameState.tiles[tileId];
    if (tile.state !== 'hidden') return;

    const newTiles = [...gameState.tiles];
    newTiles[tileId] = {
      ...tile,
      state: tile.isMine ? 'revealed-mine' : 'revealed-safe',
    };

    if (tile.isMine) {
      // Hit a mine - game over
      // Reveal all mines
      const allRevealed = newTiles.map(t => ({
        ...t,
        state: t.isMine ? 'revealed-mine' as TileState : t.state,
      }));

      setGameState({
        ...gameState,
        tiles: allRevealed,
        gameStatus: 'lost',
      });

      onGameEnd(false, null, gameState.currentMultiplier);
    } else {
      // Safe tile
      const newRevealedCount = gameState.revealedCount + 1;
      const newMultiplier = calculateMultiplier(newRevealedCount, minesCount);
      const newPrize = getPrizeForMultiplier(newMultiplier);

      setGameState({
        ...gameState,
        tiles: newTiles,
        revealedCount: newRevealedCount,
        currentMultiplier: newMultiplier,
        prize: newPrize,
      });

      // Check if won (all safe tiles revealed)
      const safeTilesCount = 25 - minesCount;
      if (newRevealedCount === safeTilesCount) {
        setGameState(prev => ({ ...prev, gameStatus: 'won' }));
        onGameEnd(true, newPrize, newMultiplier);
      }
    }
  };

  // Cash out
  const handleCashOut = () => {
    if (gameState.gameStatus !== 'playing' || gameState.revealedCount === 0) return;

    setGameState({
      ...gameState,
      gameStatus: 'won',
    });

    onGameEnd(true, gameState.prize, gameState.currentMultiplier);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-md border-2 border-amber-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Multiplier</p>
          <p className="text-2xl font-bold text-amber-600">
            {gameState.currentMultiplier.toFixed(2)}x
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Revealed</p>
          <p className="text-2xl font-bold text-blue-600">
            {gameState.revealedCount} / {25 - minesCount}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Mines</p>
          <p className="text-2xl font-bold text-red-600">{minesCount}</p>
        </div>
      </div>

      {/* Current Prize */}
      {gameState.prize && gameState.gameStatus === 'playing' && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border-2 border-amber-300">
          <p className="text-sm text-gray-600 text-center mb-1">Current Prize</p>
          <p className="text-xl font-bold text-center text-amber-900">
            {gameState.prize.label}
          </p>
        </div>
      )}

      {/* Game Board */}
      <div className="grid grid-cols-5 gap-2 p-4 bg-gray-100 rounded-lg">
        {gameState.tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={!canPlay || gameState.gameStatus !== 'playing' || tile.state !== 'hidden'}
            className={`
              aspect-square rounded-lg font-bold text-2xl transition-all duration-200
              ${tile.state === 'hidden' 
                ? 'bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 cursor-pointer shadow-md hover:scale-105' 
                : tile.state === 'revealed-safe'
                ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-inner'
                : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-inner'
              }
              ${!canPlay || gameState.gameStatus !== 'playing' ? 'cursor-not-allowed opacity-60' : ''}
            `}
          >
            {tile.state === 'revealed-safe' && '💎'}
            {tile.state === 'revealed-mine' && '💣'}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {gameState.gameStatus === 'idle' && (
          <Button
            onClick={initializeGame}
            disabled={!canPlay}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold"
          >
            Start Game
          </Button>
        )}

        {gameState.gameStatus === 'playing' && (
          <>
            <Button
              onClick={handleCashOut}
              disabled={gameState.revealedCount === 0}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg font-bold"
            >
              Cash Out ({gameState.currentMultiplier.toFixed(2)}x)
            </Button>
          </>
        )}

        {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
          <Button
            onClick={initializeGame}
            disabled={!canPlay}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold"
          >
            Play Again
          </Button>
        )}
      </div>

      {/* Game Status Message */}
      {gameState.gameStatus === 'lost' && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-red-800">Game Over!</p>
          <p className="text-red-600">You hit a mine!</p>
        </div>
      )}

      {gameState.gameStatus === 'won' && gameState.prize && (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-green-800">You Won!</p>
          <p className="text-green-600">Prize: {gameState.prize.label}</p>
        </div>
      )}
    </div>
  );
}

