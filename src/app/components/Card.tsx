"use client";

import React from 'react';

interface CardProps {
  card: string;
}

const Card: React.FC<CardProps> = ({ card }) => {
  if (card === 'back') {
    return (
      <div className="w-10 h-14 bg-blue-800 rounded-md border-2 border-white flex items-center justify-center shadow-md">
        <div className="text-white text-2xl">?</div>
      </div>
    );
  }

  const [value, suit] = [card.slice(0, -1), card.slice(-1)];
  const color = suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black';

  return (
    <div className={`w-10 h-14 bg-white rounded-md border-2 border-gray-300 flex flex-col items-center justify-between p-1 shadow-md ${color}`}>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-xl">{suit}</div>
      <div className="text-sm font-bold transform rotate-180">{value}</div>
    </div>
  );
};

export default Card;