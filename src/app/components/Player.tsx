import React, { useState, useEffect } from 'react';
import { Player as PlayerType } from '../../utils/PokerLogic';
import Card from './Card';

interface PlayerProps {
  player: PlayerType;
  position: { top: string; left: string };
  isCurrentPlayer: boolean;
  onAction: (action: string, amount: number) => void;
  showCards: boolean;
  maxBet: number;
}

const Player: React.FC<PlayerProps> = ({ player, position, isCurrentPlayer, onAction, showCards, maxBet }) => {
  const [raiseAmount, setRaiseAmount] = useState(maxBet * 2);

  useEffect(() => {
    setRaiseAmount(Math.max(maxBet * 2, player.bet * 2));
  }, [maxBet, player.bet]);

  const handleCall = () => {
    const callAmount = maxBet - player.bet;
    onAction('call', callAmount);
  };

  const handleRaise = () => {
    onAction('raise', raiseAmount);
  };

  const handleAllIn = () => {
    onAction('allIn', player.chips);
  };

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
        <div className="flex justify-center space-x-1 mb-2">
          {player.hand.map((card, index) => (
            <Card key={index} card={showCards ? card : 'back'} />
          ))}
        </div>
        {isCurrentPlayer && !player.folded && !player.isAllIn && (
          <div className="mt-2 flex flex-col items-center">
            <div className="flex space-x-1 mb-2">
              <button onClick={() => onAction('fold', 0)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Fold</button>
              <button onClick={handleCall} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Call ${maxBet - player.bet}
              </button>
              <button onClick={handleRaise} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Raise</button>
              <button onClick={handleAllIn} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">All In</button>
            </div>
            <input
              type="range"
              min={Math.max(maxBet * 2, player.bet * 2)}
              max={player.chips}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              className="w-full"
            />
            <span>Raise: ${raiseAmount}</span>
          </div>
        )}
        {player.folded && <div className="text-red-500 font-bold mt-2">Folded</div>}
        {player.isAllIn && <div className="text-yellow-500 font-bold mt-2">All In</div>}
      </div>
    </div>
  );
};

export default Player;