import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { ShieldAlert, Save, Video, Trophy } from 'lucide-react';

export function Admin() {
  const { matches, players, addGameScore, updateMatchVideos } = useTournamentStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Incorrect password. Try "admin123" for demo.');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent pointer-events-none" />
           <ShieldAlert className="w-12 h-12 text-neon-blue mx-auto mb-4" />
           <h2 className="text-2xl font-sans font-black uppercase tracking-tighter mb-2">Admin Access</h2>
           <p className="text-gray-400 text-sm mb-6">Restricted area for tournament directors.</p>
           <form onSubmit={handleLogin} className="flex flex-col gap-4">
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Enter password..."
               className="bg-dark-surface border border-glass-border p-3 rounded-lg text-white focus:outline-none focus:border-neon-blue w-full"
             />
             <button type="submit" className="w-full py-3 bg-neon-blue text-black font-bold uppercase tracking-wider rounded-lg hover:bg-white transition-colors">
               Authenticate
             </button>
           </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-glass-border">
        <div>
          <h1 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tighter text-neon-green flex items-center gap-3">
             <ShieldAlert className="w-8 h-8" /> Control Center
          </h1>
          <p className="text-gray-400 mt-1">Manage scores, videos, and tournament progression. (Best of 3)</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500 hover:text-white underline">Logout</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {['Round of 16', 'Quarter Finals', 'Semi Finals', 'Final'].map(round => (
          <div key={round} className="space-y-4">
             <h3 className="text-xl font-bold uppercase tracking-wider text-white bg-dark-surface p-3 rounded-lg border border-glass-border">{round}</h3>
             <div className="space-y-4">
               {matches.filter(m => m.round === round).map(match => (
                 <MatchEditor key={match.id} match={match} players={players} onAddGame={addGameScore} onSaveVideo={updateMatchVideos} />
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchEditor({ match, players, onAddGame, onSaveVideo }: any) {
  const p1 = players.find((p: any) => p.id === match.player1Id);
  const p2 = players.find((p: any) => p.id === match.player2Id);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [frameScoreP1, setFrameScoreP1] = useState(0);
  const [frameScoreP2, setFrameScoreP2] = useState(0);
  const [vidList, setVidList] = useState<string[]>(match.videoUrls || []);

  const handleAddGame = () => {
    if (!p1 || !p2) return alert('Match players not set yet!');
    if (!selectedWinner) return alert('Please select a winner for this game!');
    
    const gameNumber = match.games.length + 1;
    if (gameNumber > 3) return alert('Match already completed!');
    
    onAddGame(match.id, gameNumber, selectedWinner, frameScoreP1, frameScoreP2);
    setSelectedWinner('');
    setFrameScoreP1(0);
    setFrameScoreP2(0);
  };

  const handleUpdateVideo = (index: number, val: string) => {
    const newVids = [...vidList];
    newVids[index] = val;
    setVidList(newVids);
  };

  const addVideo = () => setVidList([...vidList, '']);
  const removeVideo = (index: number) => setVidList(vidList.filter((_: any, i: any) => i !== index));

  const gamesNeeded = 2 - match.scoreP1; // Games p1 needs to win
  const gamesNeededP2 = 2 - match.scoreP2; // Games p2 needs to win
  const isMatchComplete = match.scoreP1 >= 2 || match.scoreP2 >= 2;

  return (
    <div className="glass-panel p-4 rounded-xl border border-glass-border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neon-blue uppercase font-bold tracking-widest">
          {isMatchComplete ? '✓ Match Completed' : p1?.name && p2?.name ? 'Active Match (Best of 3)' : 'Pending Players'}
        </span>
        <span className="text-[10px] text-gray-500">{match.id}</span>
      </div>

      {/* Current Score Display */}
      {p1 && p2 && (
        <div className="bg-dark-surface p-3 rounded-lg border border-glass-border">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-bold ${match.scoreP1 > match.scoreP2 ? 'text-neon-blue' : 'text-gray-400'}`}>
              {p1.name}: {match.scoreP1}
            </span>
            <span className="text-gray-500 text-xs">VS</span>
            <span className={`font-bold ${match.scoreP2 > match.scoreP1 ? 'text-neon-blue' : 'text-gray-400'}`}>
              {p2.name}: {match.scoreP2}
            </span>
          </div>
        </div>
      )}

      {/* Completed Games */}
      {match.games && match.games.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-gray-400 uppercase font-bold">Completed Games:</span>
          {match.games.map((game: any) => {
            const gameWinner = game.winnerId === p1?.id ? p1 : game.winnerId === p2?.id ? p2 : null;
            return (
              <div key={game.gameNumber} className="flex items-center gap-2 text-sm bg-black/30 p-2 rounded">
                <span className="text-xs font-bold text-gray-500">Game {game.gameNumber}:</span>
                <span className={game.winnerId === p1?.id ? 'text-neon-blue font-bold' : 'text-gray-400'}>
                  {p1?.name} ({game.scoreP1})
                </span>
                <span className="text-gray-600">vs</span>
                <span className={game.winnerId === p2?.id ? 'text-neon-blue font-bold' : 'text-gray-400'}>
                  {p2?.name} ({game.scoreP2})
                </span>
                {gameWinner && <Trophy className="w-3 h-3 text-neon-green ml-auto" />}
              </div>
            );
          })}
        </div>
      )}

      {p1 && p2 && !isMatchComplete ? (
        <>
          {/* Add New Game */}
          <div className="border-t border-glass-border pt-4">
            <span className="text-xs text-neon-green uppercase font-bold tracking-widest mb-3 block">Add Game Result:</span>
            
            <div className="grid grid-cols-5 items-center gap-4 mb-3">
              <div className="col-span-2 flex flex-col gap-1 items-end text-right">
                <span className="font-medium text-sm truncate w-full">{p1.name}</span>
                <input 
                  type="number" 
                  min="0" 
                  value={frameScoreP1} 
                  onChange={e => setFrameScoreP1(Number(e.target.value))} 
                  className="w-16 bg-black border border-glass-border rounded p-1 text-center" 
                />
              </div>
              <div className="col-span-1 text-center text-gray-600 text-sm">VS</div>
              <div className="col-span-2 flex flex-col gap-1 items-start">
                <span className="font-medium text-sm truncate w-full">{p2.name}</span>
                <input 
                  type="number" 
                  min="0" 
                  value={frameScoreP2} 
                  onChange={e => setFrameScoreP2(Number(e.target.value))} 
                  className="w-16 bg-black border border-glass-border rounded p-1 text-center" 
                />
              </div>
            </div>
            
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setSelectedWinner(p1.id)} 
                className={`flex-1 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  selectedWinner === p1.id 
                    ? 'bg-neon-blue text-black' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {p1.name} Won
              </button>
              <button 
                onClick={() => setSelectedWinner(p2.id)} 
                className={`flex-1 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  selectedWinner === p2.id 
                    ? 'bg-neon-blue text-black' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {p2.name} Won
              </button>
            </div>

            <button 
              onClick={handleAddGame} 
              disabled={!selectedWinner}
              className="w-full flex items-center justify-center gap-2 bg-neon-green text-black hover:bg-white transition-colors rounded-lg py-2 text-sm font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4" /> Add Game {match.games.length + 1}
            </button>
          </div>

          {/* Video Section */}
          <div className="border-t border-glass-border pt-4 mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Match Videos</span>
              <button onClick={addVideo} className="text-xs text-neon-blue hover:text-white transition-colors">+ Add Game Video</button>
            </div>
            
            {vidList.map((vid: any, idx: any) => (
              <div key={idx} className="flex flex-col gap-1 mb-2">
                <span className="text-[10px] text-gray-500 uppercase">Game {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    value={vid} 
                    onChange={e => handleUpdateVideo(idx, e.target.value)}
                    placeholder="YouTube Embed URL"
                    className="flex-1 bg-black text-xs border border-glass-border rounded p-2 text-white"
                  />
                  <button onClick={() => removeVideo(idx)} className="text-red-500 hover:text-red-400 p-1 font-bold">X</button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => onSaveVideo(match.id, vidList.filter((v: string) => v.trim() !== ''))}
              className="w-full flex items-center justify-center gap-2 bg-neon-blue/20 text-neon-blue py-2 rounded hover:bg-neon-blue/40 mt-2 text-sm font-bold uppercase transition-colors"
            >
              <Save className="w-4 h-4" /> Save Videos
            </button>
          </div>
        </>
      ) : p1 && p2 && isMatchComplete ? (
        <div className="text-sm text-neon-green py-4 text-center font-bold">
          Match completed! Winner: {match.winnerId === p1?.id ? p1.name : p2?.name}
        </div>
      ) : (
        <div className="text-sm text-gray-500 py-4 text-center">Waiting for previous round results...</div>
      )}
    </div>
  );
}
