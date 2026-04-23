import { create } from 'zustand';
import { initialMatches, initialPlayers, Match, Player, GameScore } from '../data/initialData';
import { TOURNAMENT_API } from '../lib/tournamentSync';

interface TournamentState {
  players: Player[];
  matches: Match[];
  addGameScore: (matchId: string, gameNumber: number, winnerId: string, scoreP1: number, scoreP2: number) => void;
  updateMatchVideos: (matchId: string, videoUrls: string[]) => void;
  resetTournament: () => void;
  refreshData: () => void;
  isLoading: boolean;
  lastUpdated: number;
}

// Fetch from Vercel KV (ONLY cloud storage - no localStorage)
const fetchFromCloud = async (): Promise<{ players: Player[]; matches: Match[] } | null> => {
  try {
    console.log('🔄 Fetching from Vercel KV (Upstash Redis)...');
    const response = await fetch(TOURNAMENT_API.BASE_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Vercel KV response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Vercel KV data received:', data);
      
      if (data && data.players && data.matches) {
        console.log('✅ Successfully loaded from Vercel KV');
        return data;
      }
    } else {
      console.error('Vercel KV fetch failed:', response.statusText);
    }
  } catch (e) {
    console.error('Failed to fetch from Vercel KV:', e);
  }
  return null;
};

// Save to Vercel KV (ONLY cloud storage - no localStorage)
// NOW RETURNS Promise so we can await it
const saveToCloud = async (players: Player[], matches: Match[]): Promise<boolean> => {
  try {
    console.log('💾 Saving to Vercel KV...', { playersCount: players.length, matchesCount: matches.length });
    const response = await fetch(TOURNAMENT_API.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players, matches })
    });
    
    console.log('Vercel KV save response:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Successfully saved to Vercel KV');
      return true;
    } else {
      console.error('Failed to save to Vercel KV:', response.statusText);
      return false;
    }
  } catch (e) {
    console.error('Failed to save to Vercel KV:', e);
    return false;
  }
};

// Load data from Vercel KV ONLY (no localStorage fallback)
const loadData = async () => {
  console.log('🔄 Loading tournament data from Vercel KV...');
  
  // Fetch from Vercel KV
  const cloudData = await fetchFromCloud();
  
  if (cloudData && cloudData.players && cloudData.matches) {
    // Check if we have valid tournament data
    const hasValidData = cloudData.players.length >= 16 && cloudData.matches.length >= 15;
    
    if (hasValidData) {
      console.log('✅ Loaded complete tournament from Vercel KV');
      // Ensure games array exists for all matches
      const matchesWithGames = cloudData.matches.map((m: any) => ({
        ...m,
        games: m.games || []
      }));
      return {
        players: cloudData.players,
        matches: matchesWithGames
      };
    }
  }
  
  // If no data in Vercel KV yet, return initial tournament data
  // (First time setup - data will be saved to KV on first update)
  console.log('⚠️ No tournament data in Vercel KV yet, using initial data');
  console.log('ℹ️ Update a match score to save data to the cloud');
  return {
    players: initialPlayers,
    matches: initialMatches.map(m => ({ ...m, games: m.games || [] }))
  };
};

export const useTournamentStore = create<TournamentState>((set, get) => {
  // Start with loading state
  const initialState = {
    players: initialPlayers,
    matches: [...initialMatches],
    isLoading: true,
    lastUpdated: Date.now()
  };
  
  // Load data from Vercel KV and update state
  loadData().then((data) => {
    set({
      players: data.players,
      matches: data.matches,
      isLoading: false,
      lastUpdated: Date.now()
    });
    console.log('✅ Tournament data loaded and state updated');
  });
  
  return {
    ...initialState,

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

          // Save to Vercel KV - fire and forget (state updates immediately)
          saveToCloud(updatedPlayers, updatedMatches);
          
          return { matches: updatedMatches, players: updatedPlayers, lastUpdated: Date.now() };
        }

        // Save to Vercel KV - fire and forget (state updates immediately)
        saveToCloud(state.players, updatedMatches);
        
        return { matches: updatedMatches, lastUpdated: Date.now() };
      });
    },

    updateMatchVideos: (matchId, videoUrls) => {
      set((state) => {
        const updatedMatches = state.matches.map((m) =>
          m.id === matchId ? { ...m, videoUrls, status: m.status === 'pending' ? 'live' : m.status } : m
        );
        saveToCloud(state.players, updatedMatches);
        return { matches: updatedMatches, lastUpdated: Date.now() };
      });
    },
    
    resetTournament: () => {
      // Clear Vercel KV
      fetch(TOURNAMENT_API.BASE_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => console.error('Failed to clear Vercel KV:', e));
      
      set({
        players: initialPlayers,
        matches: [...initialMatches],
        isLoading: false,
        lastUpdated: Date.now()
      });
    },
    
    refreshData: async () => {
      // Fetch from Vercel KV ONLY
      const cloudData = await fetchFromCloud();
      if (cloudData && cloudData.players && cloudData.matches) {
        set({
          players: cloudData.players,
          matches: cloudData.matches,
          isLoading: false,
          lastUpdated: Date.now()
        });
        console.log('✅ Refreshed from Vercel KV');
        return;
      }
      
      console.log('⚠️ No data in Vercel KV');
    },
    
    isLoading: true,
    lastUpdated: Date.now()
  };
});
