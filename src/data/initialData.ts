export interface Player {
  id: string;
  name: string;
  image: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  isActive: boolean;
  seed: number;
}

export type Round = 'Round of 16' | 'Quarter Finals' | 'Semi Finals' | 'Final';

export interface Match {
  id: string;
  round: Round;
  roundSequence: number; // 1 for R16, 2 for QF, 3 for SF, 4 for Final
  matchSequenceInRound: number; // e.g. 1-8 for R16
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  status: 'pending' | 'live' | 'completed';
  scoreP1: number; // Total games won by player 1
  scoreP2: number; // Total games won by player 2
  games: GameScore[]; // Individual game scores
  videoUrls: string[]; // YouTube embed URLs
  date: string;
}

export interface GameScore {
  gameNumber: number;
  winnerId: string | null; // Which player won this game
  scoreP1: number; // Frame score for player 1
  scoreP2: number; // Frame score for player 2
}

// 16 world-class snooker player placeholders
export const initialPlayers: Player[] = [
  { id: 'p1', name: "Kartik", image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 1 },
  { id: 'p2', name: 'Mathur', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 2 },
  { id: 'p3', name: 'Tanmay', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 3 },
  { id: 'p4', name: 'Juneja', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 4 },
  { id: 'p5', name: 'Amir', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 5 },
  { id: 'p6', name: 'Lala', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 6 },
  { id: 'p7', name: 'Palkesh', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 7 },
  { id: 'p8', name: 'Banwari', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 8 },
  { id: 'p9', name: 'Mangal', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 9 },
  { id: 'p10', name: 'Yasharth', image: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 10 },
  { id: 'p11', name: 'Dev', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 11 },
  { id: 'p12', name: 'Vikas', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 12 },
  { id: 'p13', name: 'Aadesh', image: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 13 },
  { id: 'p14', name: 'Akshat', image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 14 },
  { id: 'p15', name: 'Aman', image: 'https://images.unsplash.com/photo-1504257432389-523431e1a18b?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 15 },
  { id: 'p16', name: 'Aviral', image: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&w=300&q=80', matchesPlayed: 0, wins: 0, losses: 0, isActive: true, seed: 16 },
];

export const initialMatches: Match[] = [
  // Round of 16 (8 matches)
  { id: 'm1', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 1, player1Id: 'p4', player2Id: 'p3', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-23T16:00:00Z' },
  { id: 'm2', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 2, player1Id: 'p1', player2Id: 'p2', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-23T18:00:00Z' },
  { id: 'm3', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 3, player1Id: 'p5', player2Id: 'p6', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: ['https://www.youtube.com/embed/b0bOXXA0mQo'], date: '2026-04-24T16:00:00Z' },
  { id: 'm4', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 4, player1Id: 'p7', player2Id: 'p8', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-24T18:00:00Z' },
  { id: 'm5', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 5, player1Id: 'p9', player2Id: 'p10', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-25T16:00:00Z' },
  { id: 'm6', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 6, player1Id: 'p11', player2Id: 'p12', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-25T18:00:00Z' },
  { id: 'm7', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 7, player1Id: 'p13', player2Id: 'p14', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-26T16:00:00Z' },
  { id: 'm8', round: 'Round of 16', roundSequence: 1, matchSequenceInRound: 8, player1Id: 'p15', player2Id: 'p16', winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-26T18:00:00Z' },

  // Quarter Finals (4 matches)
  { id: 'm9', round: 'Quarter Finals', roundSequence: 2, matchSequenceInRound: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-28T16:00:00Z' },
  { id: 'm10', round: 'Quarter Finals', roundSequence: 2, matchSequenceInRound: 2, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-28T18:00:00Z' },
  { id: 'm11', round: 'Quarter Finals', roundSequence: 2, matchSequenceInRound: 3, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-29T16:00:00Z' },
  { id: 'm12', round: 'Quarter Finals', roundSequence: 2, matchSequenceInRound: 4, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-04-29T18:00:00Z' },

  // Semi Finals (2 matches)
  { id: 'm13', round: 'Semi Finals', roundSequence: 3, matchSequenceInRound: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-05-01T16:00:00Z' },
  { id: 'm14', round: 'Semi Finals', roundSequence: 3, matchSequenceInRound: 2, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-05-01T18:00:00Z' },

  // Final (1 match)
  { id: 'm15', round: 'Final', roundSequence: 4, matchSequenceInRound: 1, player1Id: null, player2Id: null, winnerId: null, status: 'pending', scoreP1: 0, scoreP2: 0, games: [], videoUrls: [], date: '2026-05-03T16:00:00Z' }
];
