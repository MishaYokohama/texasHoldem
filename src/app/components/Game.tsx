"use client";

import React, { useState, useEffect } from 'react';
import Table from './Table';
import Player from './Player';
import { determineWinner, createDeck, shuffleDeck, Player as PlayerType, Card } from '../../utils/PokerLogic';

const SMALL_BLIND = 10;
const BIG_BLIND = 20;

const Game: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [currentRound, setCurrentRound] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);

    const newPlayers: PlayerType[] = [
      { id: 1, name: 'Player 1', chips: 1000, hand: ['', ''], bet: 0, folded: false },
      { id: 2, name: 'Player 2', chips: 1000, hand: ['', ''], bet: 0, folded: false },
      { id: 3, name: 'Player 3', chips: 1000, hand: ['', ''], bet: 0, folded: false },
      { id: 4, name: 'Player 4', chips: 1000, hand: ['', ''], bet: 0, folded: false },
      { id: 5, name: 'Player 5', chips: 1000, hand: ['', ''], bet: 0, folded: false },
      { id: 6, name: 'Player 6', chips: 1000, hand: ['', ''], bet: 0, folded: false },
    ];

    newPlayers.forEach((player, index) => {
      player.hand = [newDeck.pop()!, newDeck.pop()!];
      if (index === (dealerIndex + 1) % newPlayers.length) {
        player.chips -= SMALL_BLIND;
        player.bet = SMALL_BLIND;
      } else if (index === (dealerIndex + 2) % newPlayers.length) {
        player.chips -= BIG_BLIND;
        player.bet = BIG_BLIND;
      }
    });

    setPlayers(newPlayers);
    setCurrentPlayerIndex((dealerIndex + 3) % newPlayers.length);
    setPot(SMALL_BLIND + BIG_BLIND);
    setCurrentRound('preflop');
    setDeck(newDeck);
    setCommunityCards([]);
  };

  const handlePlayerAction = (playerId: number, action: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const playerIndex = newPlayers.findIndex(p => p.id === playerId);
      const player = newPlayers[playerIndex];

      switch (action) {
        case 'fold':
          player.folded = true;
          break;
        case 'call':
          const callAmount = Math.max(...newPlayers.map(p => p.bet)) - player.bet;
          player.chips -= callAmount;
          player.bet += callAmount;
          setPot(prev => prev + callAmount);
          break;
        case 'raise':
          player.chips -= amount;
          player.bet += amount;
          setPot(prev => prev + amount);
          break;
      }

      setCurrentPlayerIndex((playerIndex + 1) % newPlayers.length);

      if (newPlayers.filter(p => !p.folded).length === 1) {
        endHand(newPlayers);
      } else if (newPlayers.every(p => p.folded || p.bet === Math.max(...newPlayers.map(p => p.bet)))) {
        progressRound();
      }

      return newPlayers;
    });
  };

  const progressRound = () => {
    switch (currentRound) {
      case 'preflop':
        setCommunityCards(prev => [...prev, deck.pop()!, deck.pop()!, deck.pop()!]);
        setCurrentRound('flop');
        break;
      case 'flop':
        setCommunityCards(prev => [...prev, deck.pop()!]);
        setCurrentRound('turn');
        break;
      case 'turn':
        setCommunityCards(prev => [...prev, deck.pop()!]);
        setCurrentRound('river');
        break;
      case 'river':
        setCurrentRound('showdown');
        endHand(players);
        break;
    }
    resetBets();
  };

  const resetBets = () => {
    setPlayers(prevPlayers => prevPlayers.map(player => ({ ...player, bet: 0 })));
  };

  const endHand = (currentPlayers: PlayerType[]) => {
    const winners = determineWinner(currentPlayers, communityCards);
    const winAmount = Math.floor(pot / winners.length);

    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (winners.some(w => w.id === player.id)) {
          return { ...player, chips: player.chips + winAmount };
        }
        return player;
      });
    });

    setPot(0);
    setDealerIndex((dealerIndex + 1) % players.length);
    setTimeout(initializeGame, 3000);
  };

  return (
    <div className="relative w-full h-screen">
      <Table communityCards={communityCards} pot={pot} />
      {players.map((player, index) => (
        <Player
          key={player.id}
          player={player}
          position={{
            top: `${50 - 40 * Math.cos((index / 6) * 2 * Math.PI)}%`,
            left: `${50 + 40 * Math.sin((index / 6) * 2 * Math.PI)}%`
          }}
          isCurrentPlayer={index === currentPlayerIndex}
          onAction={(action, amount) => handlePlayerAction(player.id, action, amount)}
        />
      ))}
    </div>
  );
};

export default Game;