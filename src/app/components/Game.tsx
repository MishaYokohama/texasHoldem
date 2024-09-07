"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Table from './Table';
import Player from './Player';
import WinnerDisplay from './WinnerDisplay';
import NextRoundDisplay from './NextRoundDisplay';
import { determineWinner, createDeck, shuffleDeck, Player as PlayerType, Card } from '../../utils/PokerLogic';

// Константы для блайндов
// ブラインドの定数
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

  // Инициализация игры
  // ゲームの初期化
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

  // Раздача карт
  // カードを配る
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

  // Обработка действий игрока
  // プレイヤーのアクション処理
  const handlePlayerAction = (playerId: number, action: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const playerIndex = newPlayers.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return newPlayers;

      const player = newPlayers[playerIndex];
      const maxBet = Math.max(...newPlayers.map(p => p.bet));
      const minRaise = Math.max(BIG_BLIND * 2, maxBet * 2);

      switch (action) {
        case 'fold':
          player.folded = true;
          break;
        case 'call':
          const callAmount = Math.min(maxBet - player.bet, player.chips);
          player.chips -= callAmount;
          player.bet += callAmount;
          break;
        case 'raise':
          if (amount < minRaise || amount > player.chips) return newPlayers;
          player.chips -= amount - player.bet;
          player.bet = amount;
          break;
        case 'allIn':
          player.bet += player.chips;
          player.chips = 0;
          player.isAllIn = true;
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

  // Поиск следующего активного игрока
  // 次のアクティブなプレイヤーを見つける
  const findNextActivePlayer = (players: PlayerType[], currentIndex: number): number => {
    let nextIndex = (currentIndex + 1) % players.length;
    let count = 0;
    while ((players[nextIndex].folded || players[nextIndex].isAllIn || players[nextIndex].chips === 0) && count < players.length) {
      nextIndex = (nextIndex + 1) % players.length;
      count++;
    }
    return count === players.length ? -1 : nextIndex;
  };

  // Проверка завершения раунда
  // ラウンド完了のチェック
  const isRoundComplete = (players: PlayerType[], lastActionIndex: number): boolean => {
    const activePlayers = players.filter(p => !p.folded && !p.isAllIn && p.chips > 0);
    const maxBet = Math.max(...activePlayers.map(p => p.bet));
    return activePlayers.every(p => p.bet === maxBet) && 
           (lastActionIndex === dealerIndex || players[dealerIndex].folded || players[dealerIndex].isAllIn || players[dealerIndex].chips === 0);
  };

  // Создание сайд-потов
  // サイドポットの作成
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

  // Переход к следующему раунду
  // 次のラウンドへ進む
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

  // Сброс ставок
  // ベットのリセット
  const resetBets = (players: PlayerType[]) => {
    setPlayers(players.map(player => ({ ...player, bet: 0 })));
  };

  // Завершение раздачи
  // ハンドの終了
  const endHand = (currentPlayers: PlayerType[]) => {
    const activePlayers = currentPlayers.filter(p => !p.folded);
    let winners: PlayerType[] = [];
    let winAmount = 0;

    winners = determineWinner(activePlayers, communityCards);
    winAmount = Math.floor(mainPot / winners.length);
    winners.forEach(winner => {
      winner.chips += winAmount;
    });

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
    setWinAmount(winAmount);

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

  // Проверка окончания игры
  // ゲーム終了のチェック
  const checkGameOver = (currentPlayers: PlayerType[]) => {
    const humanPlayer = currentPlayers.find(p => !p.isBot);
    if (!humanPlayer || humanPlayer.chips === 0 || currentPlayers.length === 1) {
      setGameOver(true);
    } else {
      startNewRound(currentPlayers);
    }
  };

  // Начало нового раунда
  // 新しいラウンドの開始
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

  // Определение действия бота
  // ボットのアクション決定
  const decideBotAction = (bot: PlayerType, round: string): { action: string, amount: number } => {
    const maxBet = Math.max(...players.map(p => p.bet));
    const callAmount = Math.min(maxBet - bot.bet, bot.chips);
    const potSize = mainPot + sidePots.reduce((sum, pot) => sum + pot.amount, 0);
    const randomFactor = Math.random();

    const minRaise = Math.max(BIG_BLIND * 2, maxBet * 2);
    const maxRaise = Math.min(bot.chips, potSize);
    
    const raiseThreshold = {
      'preflop': 0.3,
      'flop': 0.4,
      'turn': 0.5,
      'river': 0.6
    }[round] || 0.3;

    if (callAmount === 0) {
      if (randomFactor < 0.5) return { action: 'check', amount: 0 };
      const raiseAmount = Math.floor(minRaise + (maxRaise - minRaise) * randomFactor);
      return { action: 'raise', amount: raiseAmount };
    }

    if (randomFactor < 0.1) return { action: 'fold', amount: 0 };
    if (randomFactor < raiseThreshold) return { action: 'call', amount: callAmount };
    
    const raiseMultiplier = 1 + randomFactor;
    const raiseAmount = Math.floor(Math.min(maxRaise, callAmount * raiseMultiplier + BIG_BLIND * randomFactor * 5));
    return { action: 'raise', amount: raiseAmount };
  };

  // Определение человека-игрока
  // 人間プレイヤーの特定
  const humanPlayer = useMemo(() => players.find(p => !p.isBot), [players]);

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
            maxBet={Math.max(...players.map(p => p.bet))}
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
            {humanPlayer && humanPlayer.chips > 0 ? (
              <>
                <p className="text-xl">Congratulations! You won!</p>
                <p className="text-lg">Your chips: ${humanPlayer.chips}</p>
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