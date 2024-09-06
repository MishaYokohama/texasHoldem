import React, { useState } from 'react';
import Card from './Card';
import { Player as PlayerType } from '../../utils/PokerLogic';

interface PlayerProps {
  player: PlayerType;
  position: { top: string; left: string };
  isCurrentPlayer: boolean;
  onAction: (action: string, amount: number) => void;
  showCards: boolean;
  maxBet: number;
  lastAction?: string;
}

const Player: React.FC<PlayerProps> = ({ player, position, isCurrentPlayer, onAction, showCards, maxBet, lastAction }) => {
  const [raiseAmount, setRaiseAmount] = useState(0);

  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: position.top, left: position.left }}>
      <div className={`bg-white rounded-lg p-2 ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
        <div className="flex items-center mb-2">
          <img src={`/avatars/avatar${player.id}.png`} alt={player.name} className="w-12 h-12 rounded-full mr-2" />
          <div>
            <div className="text-black font-bold">{player.name}</div>
            <div className="text-green-600">${player.chips}</div>
          </div>
        </div>
        {player.bet > 0 && <div className="text-blue-600 text-sm mb-2">Bet: ${player.bet}</div>}
        {lastAction && <div className="text-purple-600 text-sm mb-2">Action: {lastAction}</div>}
        <div className="flex justify-center space-x-1 mb-2">
          {player.hand.map((card, index) => (
            <Card key={index} card={showCards ? card : 'back'} />
          ))}
        </div>
        {isCurrentPlayer && !player.folded && !player.isAllIn && (
          <div className="mt-2 flex flex-col items-center">
            <div className="flex space-x-1 mb-2">
              <button onClick={() => onAction('fold', 0)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Fold</button>
              <button onClick={() => onAction('call', maxBet)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Call</button>
              <button onClick={() => onAction('raise', raiseAmount)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Raise</button>
              <button onClick={() => onAction('allIn', player.chips)} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">All In</button>
            </div>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Math.min(player.chips, Math.max(maxBet, parseInt(e.target.value) || 0)))}
              className="w-full px-2 py-1 rounded text-sm"
            />
          </div>
        )}
        {player.folded && <div className="text-red-500 font-bold mt-2">Folded</div>}
        {player.isAllIn && <div className="text-yellow-500 font-bold mt-2">All In</div>}
      </div>
    </div>
  );
};

export default Player;