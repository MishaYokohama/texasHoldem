export type Card = string;
export type Hand = [Card, Card];

export interface Player {
  id: number;
  name: string;
  chips: number;
  hand: Hand;
  bet: number;
  folded: boolean;
}

const cardValues: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function getCardValue(card: Card): number {
  return cardValues[card.slice(0, -1)];
}

function getCardSuit(card: Card): string {
  return card.slice(-1);
}

function getHandRank(hand: Card[]): [number, number[]] {
  const values = hand.map(getCardValue).sort((a, b) => b - a);
  const suits = hand.map(getCardSuit);
  const valueCounts = values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const isFlush = suits.every(suit => suit === suits[0]);
  const isStraight = values.every((val, i) => i === 0 || val === values[i - 1] - 1) ||
    (values[0] === 14 && values.slice(1).every((val, i) => val === 5 - i)); // Ace-low straight

  // Royal Flush
  if (isFlush && isStraight && values[0] === 14) return [10, values];

  // Straight Flush
  if (isFlush && isStraight) return [9, values];

  // Four of a Kind
  const fourOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 4);
  if (fourOfAKind) {
    const kicker = values.find(v => v !== Number(fourOfAKind[0]));
    return [8, [Number(fourOfAKind[0]), kicker!]];
  }

  // Full House
  const threeOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 3);
  const pair = Object.entries(valueCounts).find(([_, count]) => count === 2);
  if (threeOfAKind && pair) {
    return [7, [Number(threeOfAKind[0]), Number(pair[0])]];
  }

  // Flush
  if (isFlush) return [6, values];

  // Straight
  if (isStraight) return [5, values];

  // Three of a Kind
  if (threeOfAKind) {
    const kickers = values.filter(v => v !== Number(threeOfAKind[0])).slice(0, 2);
    return [4, [Number(threeOfAKind[0]), ...kickers]];
  }

  // Two Pair
  const pairs = Object.entries(valueCounts).filter(([_, count]) => count === 2);
  if (pairs.length === 2) {
    const kicker = values.find(v => v !== Number(pairs[0][0]) && v !== Number(pairs[1][0]));
    return [3, [Math.max(Number(pairs[0][0]), Number(pairs[1][0])), Math.min(Number(pairs[0][0]), Number(pairs[1][0])), kicker!]];
  }

  // One Pair
  if (pair) {
    const kickers = values.filter(v => v !== Number(pair[0])).slice(0, 3);
    return [2, [Number(pair[0]), ...kickers]];
  }

  // High Card
  return [1, values.slice(0, 5)];
}

export function determineWinner(players: Player[], communityCards: Card[]): Player[] {
  const activePlayers = players.filter(player => !player.folded);
  const playerHands = activePlayers.map(player => ({
    player,
    handRank: getHandRank([...player.hand, ...communityCards])
  }));

  playerHands.sort((a, b) => {
    if (a.handRank[0] !== b.handRank[0]) {
      return b.handRank[0] - a.handRank[0];
    }
    for (let i = 0; i < a.handRank[1].length; i++) {
      if (a.handRank[1][i] !== b.handRank[1][i]) {
        return b.handRank[1][i] - a.handRank[1][i];
      }
    }
    return 0;
  });

  const winningRank = playerHands[0].handRank;
  return playerHands
    .filter(ph => ph.handRank[0] === winningRank[0] && ph.handRank[1].every((v, i) => v === winningRank[1][i]))
    .map(ph => ph.player);
}

export function createDeck(): Card[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return suits.flatMap(suit => values.map(value => value + suit));
}

export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}