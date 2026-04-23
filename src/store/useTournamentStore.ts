import { create } from 'zustand';
import { initialMatches, initialPlayers, Match, Player } from '../data/initialData';

interface TournamentState {
  players: Player[];
  matches: Match[];
  setWinner: (matchId: string, winnerId: string, scoreP1: number, scoreP2: number) => void;
  updateMatchVideos: (matchId: string, videoUrls: string[]) => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  players: initialPlayers,
  matches: [...initialMatches], // Load from initial, could be persisted to localStorage

  setWinner: (matchId, winnerId, scoreP1, scoreP2) => {
    set((state) => {
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      const updatedMatches = [...state.matches];
      const match = { ...updatedMatches[matchIndex], winnerId, status: 'completed' as const, scoreP1, scoreP2 };
      updatedMatches[matchIndex] = match;

      // Logic to advance the winner
      const nextRoundSequence = match.roundSequence + 1;
      if (nextRoundSequence <= 4) {
        // e.g. R16 m1 (matchSeq 1) and m2 (matchSeq 2) both feed into QF m1 (matchSeq 1)
        // R16 m3 (matchSeq 3) and m4 (matchSeq 4) feed into QF m2 (matchSeq 2)
        const nextMatchMatchSequence = Math.ceil(match.matchSequenceInRound / 2);
        const nextMatchIndex = updatedMatches.findIndex(
          (m) => m.roundSequence === nextRoundSequence && m.matchSequenceInRound === nextMatchMatchSequence
        );

        if (nextMatchIndex !== -1) {
          const nextMatch = { ...updatedMatches[nextMatchIndex] };
          // If the completed match was the "first" in the pair, it populates player1
          if (match.matchSequenceInRound % 2 !== 0) {
            nextMatch.player1Id = winnerId;
          } else {
            nextMatch.player2Id = winnerId;
          }
          updatedMatches[nextMatchIndex] = nextMatch;
        }
      }

      // Update player stats
      const loserId = match.player1Id === winnerId ? match.player2Id : match.player1Id;
      const updatedPlayers = state.players.map((p) => {
        if (p.id === winnerId) {
          return { ...p, wins: p.wins + 1, matchesPlayed: p.matchesPlayed + 1 };
        }
        if (p.id === loserId) {
          return { ...p, losses: p.losses + 1, matchesPlayed: p.matchesPlayed + 1, isActive: false };
        }
        return p;
      });

      return { matches: updatedMatches, players: updatedPlayers };
    });
  },

  updateMatchVideos: (matchId, videoUrls) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, videoUrls, status: m.status === 'pending' ? 'live' : m.status } : m
      ),
    }));
  },
}));
