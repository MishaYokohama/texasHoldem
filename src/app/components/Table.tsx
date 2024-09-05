"use client";

import React from 'react';
import Card from './Card';
import { Card as CardType } from '../../utils/PokerLogic';

interface TableProps {
  communityCards: CardType[];
  pot: number;
}

const Table: React.FC<TableProps> = ({ communityCards, pot }) => {
  return (
    <div className="absolute inset-0 m-auto w-3/4 h-1/2 bg-green-800 rounded-full flex flex-col items-center justify-center">
      <div className="flex justify-center mb-4">
        {communityCards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
      <div className="text-white text-2xl font-bold">Pot: ${pot}</div>
    </div>
  );
};

export default Table;