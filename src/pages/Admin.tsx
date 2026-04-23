import { useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { ShieldAlert, Save, Video, Trophy } from 'lucide-react';

export function Admin() {
  const { matches, players, setWinner, updateMatchVideo } = useTournamentStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
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
          <p className="text-gray-400 mt-1">Manage scores, videos, and tournament progression.</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500 hover:text-white underline">Logout</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {['Round of 16', 'Quarter Finals', 'Semi Finals', 'Final'].map(round => (
          <div key={round} className="space-y-4">
             <h3 className="text-xl font-bold uppercase tracking-wider text-white bg-dark-surface p-3 rounded-lg border border-glass-border">{round}</h3>
             <div className="space-y-4">
               {matches.filter(m => m.round === round).map(match => (
                 <MatchEditor key={match.id} match={match} players={players} onSave={setWinner} onSaveVideo={updateMatchVideo} />
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchEditor({ match, players, onSave, onSaveVideo }: any) {
  const p1 = players.find((p: any) => p.id === match.player1Id);
  const p2 = players.find((p: any) => p.id === match.player2Id);
  const [s1, setS1] = useState(match.scoreP1);
  const [s2, setS2] = useState(match.scoreP2);
  const [vidList, setVidList] = useState<string[]>(match.videoUrls || []);

  const handleUpdateScore = () => {
    if (!p1 || !p2) return alert('Match players not set yet!');
    const winnerId = s1 > s2 ? p1.id : s2 > s1 ? p2.id : null;
    if (!winnerId && s1 !== 0 && s2 !== 0) return alert('Needs a clear winner!');
    if (!winnerId) return alert('Update scores to define a winner');
    onSave(match.id, winnerId, s1, s2);
  };

  const handleUpdateVideo = (index: number, val: string) => {
    const newVids = [...vidList];
    newVids[index] = val;
    setVidList(newVids);
  };

  const addVideo = () => setVidList([...vidList, '']);
  const removeVideo = (index: number) => setVidList(vidList.filter((_, i) => i !== index));

  return (
    <div className="glass-panel p-4 rounded-xl border border-glass-border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neon-blue uppercase font-bold tracking-widest">{p1?.name && p2?.name ? 'Active Match (Best of 3)' : 'Pending Players'}</span>
        <span className="text-[10px] text-gray-500">{match.id}</span>
      </div>

      {p1 && p2 ? (
        <>
          <div className="grid grid-cols-5 items-center gap-4">
            <div className="col-span-2 flex flex-col gap-1 items-end text-right">
              <span className="font-medium text-sm truncate w-full">{p1.name}</span>
              <input type="number" min="0" max="2" value={s1} onChange={e => setS1(Number(e.target.value))} className="w-16 bg-black border border-glass-border rounded p-1 text-center" />
            </div>
            <div className="col-span-1 text-center text-gray-600 text-sm">VS</div>
            <div className="col-span-2 flex flex-col gap-1 items-start">
              <span className="font-medium text-sm truncate w-full">{p2.name}</span>
              <input type="number" min="0" max="2" value={s2} onChange={e => setS2(Number(e.target.value))} className="w-16 bg-black border border-glass-border rounded p-1 text-center" />
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
             <button onClick={handleUpdateScore} disabled={match.status === 'completed'} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-neon-green hover:text-black transition-colors rounded-lg py-2 text-sm font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed">
               <Trophy className="w-4 h-4" /> {match.status === 'completed' ? 'Completed' : 'Set Winner'}
             </button>
          </div>

          <div className="border-t border-glass-border pt-4 mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Match Videos</span>
              <button onClick={addVideo} className="text-xs text-neon-blue hover:text-white transition-colors">+ Add Game Video</button>
            </div>
            
            {vidList.map((vid, idx) => (
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
      ) : (
        <div className="text-sm text-gray-500 py-4 text-center">Waiting for previous round results...</div>
      )}
    </div>
  );
}
