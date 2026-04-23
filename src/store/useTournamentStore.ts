import { create } from 'zustand';
import { initialMatches, initialPlayers, Match, Player, GameScore } from '../data/initialData';
import { JSONBIN_CONFIG } from '../lib/tournamentSync';

interface TournamentState {
  players: Player[];
  matches: Match[];
  addGameScore: (matchId: string, gameNumber: number, winnerId: string, scoreP1: number, scoreP2: number) => void;
  updateMatchVideos: (matchId: string, videoUrls: string[]) => void;
  resetTournament: () => void;
  refreshData: () => void;
  lastUpdated: number;
}

// Fetch from JSONBin (cloud storage)
const fetchFromCloud = async (): Promise<{ players: Player[]; matches: Match[] } | null> => {
  try {
    console.log('🔄 Fetching from JSONBin...');
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': JSONBIN_CONFIG.API_KEY
      }
    });
    
    console.log('JSONBin response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('JSONBin data received:', data);
      // JSONBin v3 wraps data in 'record' property
      const record = data.record || data;
      if (record && record.players && record.matches) {
        console.log('✅ Successfully loaded from JSONBin');
        return record;
      }
    } else {
      console.error('JSONBin fetch failed:', response.statusText);
    }
  } catch (e) {
    console.error('Failed to fetch from JSONBin:', e);
  }
  return null;
};

// Save to JSONBin (cloud storage)
const saveToCloud = async (players: Player[], matches: Match[]) => {
  try {
    console.log('💾 Saving to JSONBin...', { playersCount: players.length, matchesCount: matches.length });
    const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_CONFIG.API_KEY
      },
      body: JSON.stringify({ players, matches })
    });
    
    console.log('JSONBin save response:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Successfully saved to JSONBin');
    } else {
      console.error('Failed to save to JSONBin:', response.statusText);
    }
  } catch (e) {
    console.error('Failed to save to JSONBin:', e);
  }
};

// Load from cloud (JSONBin) or fallback to localStorage or use initial data
const loadFromStorage = async () => {
  // Try cloud first
  const cloudData = await fetchFromCloud();
  if (cloudData) {
    console.log('✅ Loaded from cloud (JSONBin)');
    return cloudData;
  }
  
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('snooker-tournament');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('✅ Loaded from localStorage (fallback)');
      return {
        players: parsed.players || initialPlayers,
        matches: parsed.matches || initialMatches
      };
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  
  console.log('✅ Using initial data');
  return {
    players: initialPlayers,
    matches: [...initialMatches]
  };
};

const saveToStorage = (players: Player[], matches: Match[]) => {
  // Save to localStorage (local backup)
  try {
    localStorage.setItem('snooker-tournament', JSON.stringify({ players, matches }));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  
  // Save to cloud (JSONBin) - async, fire and forget
  saveToCloud(players, matches).catch(e => {
    console.error('Failed to save to cloud:', e);
  });
};

export const useTournamentStore = create<TournamentState>((set, get) => {
  // Initialize with empty state, will load async
  const initialState = {
    players: initialPlayers,
    matches: [...initialMatches],
    lastUpdated: Date.now()
  };
  
  // Load data asynchronously
  loadFromStorage().then((data) => {
    set({
      players: data.players,
      matches: data.matches,
      lastUpdated: Date.now()
    });
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

          // Save to localStorage
          saveToStorage(updatedPlayers, updatedMatches);
          
          return { matches: updatedMatches, players: updatedPlayers };
        }

        // Save to localStorage
        saveToStorage(state.players, updatedMatches);
        
        return { matches: updatedMatches };
      });
    },

    updateMatchVideos: (matchId, videoUrls) => {
      set((state) => {
        const updatedMatches = state.matches.map((m) =>
          m.id === matchId ? { ...m, videoUrls, status: m.status === 'pending' ? 'live' : m.status } : m
        );
        saveToStorage(state.players, updatedMatches);
        return { matches: updatedMatches };
      });
    },
    
    resetTournament: () => {
      localStorage.removeItem('snooker-tournament');
      set({
        players: initialPlayers,
        matches: [...initialMatches],
        lastUpdated: Date.now()
      });
    },
    
    refreshData: async () => {
      // Fetch from cloud first
      const cloudData = await fetchFromCloud();
      if (cloudData) {
        set({
          players: cloudData.players,
          matches: cloudData.matches,
          lastUpdated: Date.now()
        });
        console.log('✅ Refreshed from cloud');
        return;
      }
      
      // Fallback to localStorage
      const updated = loadFromStorage();
      set({
        players: (await updated).players,
        matches: (await updated).matches,
        lastUpdated: Date.now()
      });
      console.log('✅ Refreshed from localStorage');
    },
    
    lastUpdated: Date.now()
  };
});
