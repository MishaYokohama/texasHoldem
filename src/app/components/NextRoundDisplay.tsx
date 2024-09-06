"use client";

import React from 'react';

const NextRoundDisplay: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold">Next Round</h2>
      </div>
    </div>
  );
};

export default NextRoundDisplay;