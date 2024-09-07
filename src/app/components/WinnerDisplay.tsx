// WinnerDisplay.tsx

"use client";
import React from 'react';
import { Player } from '../../utils/PokerLogic';

interface WinnerDisplayProps {
  winners: Player[];
  winAmount: number;
}

// Компонент отображения победителей
// 勝者表示コンポーネント
const WinnerDisplay: React.FC<WinnerDisplayProps> = React.memo(({ winners, winAmount }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {winners.length > 1 ? 'Winners!' : 'Winner!'}
        </h2>
        <div className="flex justify-center space-x-4 mb-4">
          {winners.map((winner) => (
            <div key={winner.id} className="text-center">
              <img
                src={`/avatars/avatar${winner.id}.png`}
                alt={winner.name}
                className="w-24 h-24 rounded-full mx-auto mb-2"
              />
              <p className="font-bold">{winner.name}</p>
            </div>
          ))}
        </div>
        <p className="text-xl">
          Won: ${winAmount}
        </p>
      </div>
    </div>
  );
});

export default WinnerDisplay;