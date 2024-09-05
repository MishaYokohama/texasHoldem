"use client";

import React from 'react';

interface CardProps {
  card: string;
}

const Card: React.FC<CardProps> = ({ card }) => {
  const [value, suit] = [card.slice(0, -1), card.slice(-1)];
  const color = suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black';

  return (
    <div className={`w-12 h-16 bg-white rounded-lg border border-gray-300 flex flex-col items-center justify-between p-1 mx-1 ${color}`}>
      <div className="text-sm">{value}</div>
      <div className="text-2xl">{suit}</div>
      <div className="text-sm transform rotate-180">{value}</div>
    </div>
  );
};

export default Card;