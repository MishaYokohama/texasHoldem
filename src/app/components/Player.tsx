"use client";

import React, { useState } from 'react';
import Card from './Card';
import { Player as PlayerType } from '../../utils/PokerLogic';

interface PlayerProps {
  player: PlayerType;
  position: { top: string; left: string };
  isCurrentPlayer: boolean;
  onAction: (action: string, amount: number) => void;
}

const Player: React.FC<PlayerProps> = ({ player, position, isCurrentPlayer, onAction }) => {
  const [raiseAmount, setRaiseAmount] = useState(0);

  return (
    <div className="absolute" style={{ top: position.top, left: position.left }}>
      <div className={`bg-white rounded-full w-16 h-16 flex items-center justify-center ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
        <img src={`/avatar${player.id}.jpg`} alt={player.name} className="w-14 h-14 rounded-full" />
      </div>
      <div className="mt-2 text-white text-center">
        <div>{player.name}</div>
        <div>${player.chips}</div>
        {player.bet > 0 && <div>Bet: ${player.bet}</div>}
      </div>
      <div className="flex mt-2">
        {player.hand.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
      {isCurrentPlayer && !player.folded && (
        <div className="mt-2 flex flex-col items-center">
          <div className="flex mb-2">
            <button onClick={() => onAction('fold', 0)} className="bg-red-500 text-white px-2 py-1 rounded mr-1">Fold</button>
            <button onClick={() => onAction('call', 0)} className="bg-blue-500 text-white px-2 py-1 rounded mr-1">Call</button>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Math.max(0, parseInt(e.target.value)))}
              className="w-16 px-1 py-1 rounded mr-1"
            />
            <button onClick={() => onAction('raise', raiseAmount)} className="bg-green-500 text-white px-2 py-1 rounded">Raise</button>
          </div>
        </div>
      )}
      {player.folded && <div className="text-red-500 font-bold mt-2">Folded</div>}
    </div>
  );
};

export default Player;