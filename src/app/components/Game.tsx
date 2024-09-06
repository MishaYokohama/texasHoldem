"use client";

import React, { useState, useEffect } from 'react';
import Table from './Table';
import Player from './Player';
import WinnerDisplay from './WinnerDisplay';
import NextRoundDisplay from './NextRoundDisplay';
import { determineWinner, createDeck, shuffleDeck, Player as PlayerType, Card } from '../../utils/PokerLogic';

const SMALL_BLIND = 10;
const BIG_BLIND = 20;

const Game: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [mainPot, setMainPot] = useState(0);
  const [sidePots, setSidePots] = useState<{amount: number, players: number[]}[]>([]);
  const [currentRound, setCurrentRound] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [winners, setWinners] = useState<PlayerType[]>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [showNextRound, setShowNextRound] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!gameOver && currentPlayerIndex !== -1 && currentPlayerIndex !== 0 && currentRound !== 'showdown') {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer && currentPlayer.isBot && !currentPlayer.folded && !currentPlayer.isAllIn && currentPlayer.chips > 0) {
        setTimeout(() => {
          const botAction = decideBotAction(currentPlayer, currentRound);
          handlePlayerAction(currentPlayer.id, botAction.action, botAction.amount);
        }, 1000);
      }
    }
  }, [currentPlayerIndex, currentRound, gameOver, players]);

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);

    const newPlayers: PlayerType[] = [
      { id: 1, name: 'You', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: false, isAllIn: false },
      { id: 2, name: 'Bot 1', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: true, isAllIn: false },
      { id: 3, name: 'Bot 2', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: true, isAllIn: false },
      { id: 4, name: 'Bot 3', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: true, isAllIn: false },
      { id: 5, name: 'Bot 4', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: true, isAllIn: false },
      { id: 6, name: 'Bot 5', chips: 1000, hand: ['', ''], bet: 0, folded: false, isBot: true, isAllIn: false },
    ];

    dealCards(newPlayers, newDeck);
    setPlayers(newPlayers);
    setCurrentPlayerIndex((dealerIndex + 3) % newPlayers.length);
    setMainPot(newPlayers.reduce((total, player) => total + player.bet, 0));
    setSidePots([]);
    setCurrentRound('preflop');
    setDeck(newDeck);
    setCommunityCards([]);
    setGameOver(false);
  };

  // Продолжение следует...
  const dealCards = (players: PlayerType[], deck: Card[]) => {
    players.forEach((player, index) => {
      player.hand = [deck.pop()!, deck.pop()!];
      player.folded = false;
      player.isAllIn = false;
      if (index === (dealerIndex + 1) % players.length) {
        const smallBlindAmount = Math.min(SMALL_BLIND, player.chips);
        player.chips -= smallBlindAmount;
        player.bet = smallBlindAmount;
      } else if (index === (dealerIndex + 2) % players.length) {
        const bigBlindAmount = Math.min(BIG_BLIND, player.chips);
        player.chips -= bigBlindAmount;
        player.bet = bigBlindAmount;
      } else {
        player.bet = 0;
      }
    });
  };

  const handlePlayerAction = (playerId: number, action: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const playerIndex = newPlayers.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return newPlayers;

      const player = newPlayers[playerIndex];
      const maxBet = Math.max(...newPlayers.map(p => p.bet));

      switch (action) {
        case 'fold':
          player.folded = true;
          break;
        case 'call':
        case 'raise':
        case 'allIn':
          const betAmount = action === 'allIn' ? player.chips : Math.min(amount, player.chips);
          if (betAmount + player.bet >= maxBet) {
            const actualBet = Math.min(betAmount, maxBet - player.bet);
            player.chips -= actualBet;
            player.bet += actualBet;
            if (player.chips === 0) {
              player.isAllIn = true;
              createSidePots(newPlayers);
            }
          } else {
            player.isAllIn = true;
            player.bet += player.chips;
            player.chips = 0;
            createSidePots(newPlayers);
          }
          break;
      }

      const activePlayers = newPlayers.filter(p => !p.folded && !p.isAllIn);
      if (activePlayers.length <= 1) {
        endHand(newPlayers);
      } else if (isRoundComplete(newPlayers, playerIndex)) {
        progressRound(newPlayers);
      } else {
        const nextPlayerIndex = findNextActivePlayer(newPlayers, playerIndex);
        setCurrentPlayerIndex(nextPlayerIndex);
      }

      return newPlayers;
    });
  };

  const findNextActivePlayer = (players: PlayerType[], currentIndex: number): number => {
    let nextIndex = (currentIndex + 1) % players.length;
    let count = 0;
    while ((players[nextIndex].folded || players[nextIndex].isAllIn || players[nextIndex].chips === 0) && count < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      count++;
    }
    return count === players.length ? -1 : nextIndex;
  };

  const isRoundComplete = (players: PlayerType[], lastActionIndex: number): boolean => {
    const activePlayers = players.filter(p => !p.folded && !p.isAllIn && p.chips > 0);
    const maxBet = Math.max(...activePlayers.map(p => p.bet));
    return activePlayers.every(p => p.bet === maxBet) && 
           (lastActionIndex === dealerIndex || players[dealerIndex].folded || players[dealerIndex].isAllIn || players[dealerIndex].chips === 0);
  };

  // Продолжение следует...
  const createSidePots = (players: PlayerType[]) => {
    const sortedPlayers = [...players].sort((a, b) => a.bet - b.bet);
    const newSidePots: {amount: number, players: number[]}[] = [];
    let previousBet = 0;

    sortedPlayers.forEach((player, index) => {
      if (player.bet > previousBet) {
        const potAmount = (player.bet - previousBet) * (players.length - index);
        const eligiblePlayers = sortedPlayers.slice(index).map(p => p.id);
        newSidePots.push({amount: potAmount, players: eligiblePlayers});
        previousBet = player.bet;
      }
    });

    setMainPot(newSidePots[0]?.amount || 0);
    setSidePots(newSidePots.slice(1));
  };

  const progressRound = (currentPlayers: PlayerType[]) => {
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
        endHand(currentPlayers);
        return;
    }
    resetBets(currentPlayers);
    setCurrentPlayerIndex(findNextActivePlayer(currentPlayers, dealerIndex));
  };

  const resetBets = (players: PlayerType[]) => {
    setPlayers(players.map(player => ({ ...player, bet: 0 })));
  };

  const endHand = (currentPlayers: PlayerType[]) => {
    const activePlayers = currentPlayers.filter(p => !p.folded);
    let winners: PlayerType[] = [];
    let winAmount = 0;

    // Распределение основного пота
    winners = determineWinner(activePlayers, communityCards);
    winAmount = Math.floor(mainPot / winners.length);
    winners.forEach(winner => {
      winner.chips += winAmount;
    });

    // Распределение сайд-потов
    sidePots.forEach(sidePot => {
      const eligiblePlayers = activePlayers.filter(p => sidePot.players.includes(p.id));
      const potWinners = determineWinner(eligiblePlayers, communityCards);
      const potWinAmount = Math.floor(sidePot.amount / potWinners.length);
      potWinners.forEach(winner => {
        winner.chips += potWinAmount;
      });
      winners = [...new Set([...winners, ...potWinners])];
    });

    setWinners(winners);
    setWinAmount(winAmount);  // Отображаем только выигрыш основного пота для простоты

    const updatedPlayers = currentPlayers.map(player => ({
      ...player,
      bet: 0,
      isAllIn: false
    }));

    const humanPlayer = updatedPlayers.find(p => !p.isBot);
    if (humanPlayer && humanPlayer.chips === 0) {
      setGameOver(true);
      setPlayers(updatedPlayers);
      setMainPot(0);
      setSidePots([]);
      return;
    }

    setPlayers(updatedPlayers.filter(player => player.chips > 0));
    setMainPot(0);
    setSidePots([]);
    setDealerIndex((dealerIndex + 1) % updatedPlayers.length);
    
    setTimeout(() => {
      setWinners([]);
      setShowNextRound(true);
      setTimeout(() => {
        setShowNextRound(false);
        checkGameOver(updatedPlayers.filter(player => player.chips > 0));
      }, 2000);
    }, 3000);
  };

  const checkGameOver = (currentPlayers: PlayerType[]) => {
    const humanPlayer = currentPlayers.find(p => !p.isBot);
    if (!humanPlayer || humanPlayer.chips === 0 || currentPlayers.length === 1) {
      setGameOver(true);
    } else {
      startNewRound(currentPlayers);
    }
  };

  const startNewRound = (currentPlayers: PlayerType[]) => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    dealCards(currentPlayers, newDeck);
    setPlayers(currentPlayers);
    setCurrentPlayerIndex((dealerIndex + 3) % currentPlayers.length);
    setMainPot(currentPlayers.reduce((total, player) => total + player.bet, 0));
    setSidePots([]);
    setCurrentRound('preflop');
    setCommunityCards([]);
  };

  const decideBotAction = (bot: PlayerType, round: string): { action: string, amount: number } => {
    const maxBet = Math.max(...players.map(p => p.bet));
    const callAmount = Math.min(maxBet - bot.bet, bot.chips);
    const randomAction = Math.random();

    if (bot.chips === callAmount) {
      return { action: 'allIn', amount: bot.chips };
    }

    if (callAmount === 0) {
      if (randomAction < 0.7) return { action: 'call', amount: 0 };
      return { action: 'raise', amount: Math.min(bot.chips, BIG_BLIND * 2) };
    }

    if (randomAction < 0.2) return { action: 'fold', amount: 0 };
    if (randomAction < 0.6) return { action: 'call', amount: callAmount };
    return { action: 'raise', amount: Math.min(bot.chips, callAmount + BIG_BLIND * 2) };
  };

  return (
    <div className="relative w-full h-screen bg-green-900 overflow-hidden">
      <Table communityCards={communityCards} mainPot={mainPot} sidePots={sidePots} />
      {players.map((player, index) => {
        const angle = ((index / players.length) * 2 * Math.PI) - (Math.PI / 2);
        const radius = 40;
        const top = 50 + radius * Math.sin(angle);
        const left = 50 + radius * Math.cos(angle);
        
        return (
          <Player
            key={player.id}
            player={player}
            position={{ top: `${top}%`, left: `${left}%` }}
            isCurrentPlayer={index === currentPlayerIndex}
            onAction={(action, amount) => handlePlayerAction(player.id, action, amount)}
            showCards={currentRound === 'showdown' || !player.isBot}
            maxBet={Math.max(...players.map(p => p.bet)) - player.bet}
          />
        );
      })}
      {winners.length > 0 && (
        <WinnerDisplay winners={winners} winAmount={winAmount} />
      )}
      {showNextRound && <NextRoundDisplay />}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            {players.find(p => !p.isBot)?.chips > 0 ? (
              <>
                <p className="text-xl">Congratulations! You won!</p>
                <p className="text-lg">Your chips: ${players.find(p => !p.isBot)?.chips}</p>
              </>
            ) : (
              <p className="text-xl">You lost. Better luck next time!</p>
            )}
            <button 
              onClick={initializeGame} 
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;