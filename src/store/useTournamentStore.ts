import { create } from 'zustand';
import { initialMatches, initialPlayers, Match, Player, GameScore } from '../data/initialData';

interface TournamentState {
  players: Player[];
  matches: Match[];
  addGameScore: (matchId: string, gameNumber: number, winnerId: string, scoreP1: number, scoreP2: number) => void;
  updateMatchVideos: (matchId: string, videoUrls: string[]) => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  players: initialPlayers,
  matches: [...initialMatches], // Load from initial, could be persisted to localStorage

  addGameScore: (matchId, gameNumber, winnerId, scoreP1, scoreP2) => {
    set((state) => {
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      const match = state.matches[matchIndex];
      
      // Add the new game score
      const newGame: GameScore = {
        gameNumber,
        winnerId,
        scoreP1,
        scoreP2
      };
      
      const updatedGames = [...match.games, newGame];
      
      // Calculate total scores
      const totalScoreP1 = updatedGames.filter(g => g.winnerId === match.player1Id).length;
      const totalScoreP2 = updatedGames.filter(g => g.winnerId === match.player2Id).length;
      
      // Check if match is completed (best of 3 - first to 2 wins)
      const isMatchCompleted = totalScoreP1 >= 2 || totalScoreP2 >= 2;
      const matchWinnerId = isMatchCompleted ? (totalScoreP1 >= 2 ? match.player1Id : match.player2Id) : match.winnerId;
      
      let updatedMatches = [...state.matches];
      updatedMatches[matchIndex] = {
        ...match,
        games: updatedGames,
        scoreP1: totalScoreP1,
        scoreP2: totalScoreP2,
        winnerId: matchWinnerId,
        status: isMatchCompleted ? 'completed' : match.status
      };

      // If match is completed, advance the winner
      if (isMatchCompleted && matchWinnerId) {
        const nextRoundSequence = match.roundSequence + 1;
        if (nextRoundSequence <= 4) {
          const nextMatchMatchSequence = Math.ceil(match.matchSequenceInRound / 2);
          const nextMatchIndex = updatedMatches.findIndex(
            (m) => m.roundSequence === nextRoundSequence && m.matchSequenceInRound === nextMatchMatchSequence
          );

          if (nextMatchIndex !== -1) {
            const nextMatch = { ...updatedMatches[nextMatchIndex] };
            if (match.matchSequenceInRound % 2 !== 0) {
              nextMatch.player1Id = matchWinnerId;
            } else {
              nextMatch.player2Id = matchWinnerId;
            }
            updatedMatches[nextMatchIndex] = nextMatch;
          }
        }

        // Update player stats
        const loserId = match.player1Id === matchWinnerId ? match.player2Id : match.player1Id;
        const updatedPlayers = state.players.map((p) => {
          if (p.id === matchWinnerId) {
            return { ...p, wins: p.wins + 1, matchesPlayed: p.matchesPlayed + 1 };
          }
          if (p.id === loserId) {
            return { ...p, losses: p.losses + 1, matchesPlayed: p.matchesPlayed + 1, isActive: false };
          }
          return p;
        });

        return { matches: updatedMatches, players: updatedPlayers };
      }

      return { matches: updatedMatches };
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
