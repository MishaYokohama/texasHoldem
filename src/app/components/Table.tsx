// Table.tsx

import React from 'react';
import Card from './Card';
import { Card as CardType } from '../../utils/PokerLogic';

interface TableProps {
  communityCards: CardType[];
  mainPot: number;
  sidePots: Array<{ amount: number; players: number[] }>;
}

// Компонент игрового стола
// ゲームテーブルコンポーネント
const Table: React.FC<TableProps> = React.memo(({ communityCards, mainPot, sidePots }) => {
  return (
    <div className="absolute inset-0 m-auto w-3/4 h-1/2 bg-green-700 rounded-full border-8 border-brown-600 flex flex-col items-center justify-center shadow-xl">
      {communityCards.length > 0 && (
        <div className="flex justify-center mb-4 space-x-2">
          {communityCards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
      )}
      <div className="text-white text-3xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
        Main Pot: ${mainPot}
      </div>
      {sidePots.map((sidePot, index) => (
        <div key={index} className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-1 rounded mt-2">
          Side Pot {index + 1}: ${sidePot.amount}
        </div>
      ))}
    </div>
  );
});

export default Table;