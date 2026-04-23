import { useParams, Link } from 'react-router-dom';
import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { Play, ArrowLeft, Trophy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function MatchDetail() {
  const { id } = useParams();
  const { matches, players } = useTournamentStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  
  const match = matches.find(m => m.id === id);
  if (!match) return <div className="p-8 text-center text-gray-400">Match not found.</div>;

  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  // Suggested next matches
  const recentMatches = matches.filter(m => m.id !== match.id && m.videoUrls && m.videoUrls.length > 0).slice(0, 3);
  
  const hasVideos = match.videoUrls && match.videoUrls.length > 0;
  const currentVideo = hasVideos && activeVideoIndex < match.videoUrls.length ? match.videoUrls[activeVideoIndex] : null;

  return (
    <div className="flex-1 w-full flex flex-col pt-0">
      <div className="bg-black border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
           <Link to="/matches" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to matches
           </Link>
        </div>
      </div>

      <div className="flex-1 max-w-[2000px] w-full mx-auto pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3">
              {/* Video Player */}
              <div className="w-full aspect-video bg-dark-surface border-b border-glass-border shadow-2xl relative group">
                {currentVideo ? (
                  <iframe
                    src={`${currentVideo}?autoplay=0&rel=0`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Play className="w-16 h-16 mb-4 opacity-20" />
                    <p className="uppercase tracking-widest font-bold">Video not available yet</p>
                  </div>
                )}
              </div>
              
              {/* Game Selector for Best of 3 */}
              {hasVideos && match.videoUrls.length > 1 && (
                <div className="flex gap-2 p-4 bg-dark-bg border-b border-glass-border overflow-x-auto">
                  {match.videoUrls.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveVideoIndex(i)}
                      className={cn(
                        "px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap", 
                        activeVideoIndex === i 
                          ? "bg-neon-green text-black" 
                          : "glass-panel text-gray-400 hover:text-white"
                      )}
                    >
                      Game {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Match Header */}
              <div className="p-6 md:p-8 max-w-5xl mx-auto">
                 <div className="flex flex-wrap items-center gap-3 mb-4">
                   <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-dark-surface text-gray-300 border border-glass-border rounded-full">
                     {match.round}
                   </span>
                   {match.status === 'live' && (
                     <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-red-600/20 text-red-500 border border-red-600/30 rounded-full animate-pulse">
                       Live Now
                     </span>
                   )}
                 </div>
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                   <h1 className="text-3xl md:text-5xl font-sans font-black italic uppercase tracking-tighter leading-tight">
                     <span className={match.winnerId === p1?.id ? "text-neon-blue" : ""}>{p1?.name || 'TBD'}</span>
                     <span className="text-gray-600 italic font-sans mx-4 text-2xl md:text-3xl">vs</span>
                     <span className={match.winnerId === p2?.id ? "text-neon-blue" : ""}>{p2?.name || 'TBD'}</span>
                   </h1>
                   
                   {match.status === 'completed' && (
                     <div className="flex items-center gap-4 shrink-0 bg-dark-surface px-6 py-4 rounded-2xl border border-glass-border">
                       <div className={`text-5xl font-mono tracking-tighter font-bold ${match.winnerId === p1?.id ? 'text-white' : 'text-gray-400'}`}>{match.scoreP1}</div>
                       <div className="w-px h-8 bg-glass-border" />
                       <div className={`text-5xl font-mono tracking-tighter font-bold ${match.winnerId === p2?.id ? 'text-white' : 'text-gray-400'}`}>{match.scoreP2}</div>
                     </div>
                   )}
                 </div>

                 {/* Detailed Frame Score Breakdown */}
                 {match.games && match.games.length > 0 && (
                   <div className="bg-dark-surface/50 border border-glass-border rounded-2xl p-6 mb-8">
                     <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                       <Trophy className="w-5 h-5 text-neon-green" />
                       Frame-by-Frame Breakdown
                     </h3>
                     
                     <div className="space-y-3">
                       {match.games.map((game, index) => {
                         const gameWinner = game.winnerId === p1?.id ? p1 : game.winnerId === p2?.id ? p2 : null;
                         const isP1Winner = game.winnerId === p1?.id;
                         
                         return (
                           <motion.div
                             key={game.gameNumber}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: index * 0.1 }}
                             className="bg-black/40 rounded-xl p-4 border border-glass-border"
                           >
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                 Frame {game.gameNumber}
                               </span>
                               {gameWinner && (
                                 <span className="text-xs font-bold text-neon-green flex items-center gap-1">
                                   <Trophy className="w-3 h-3" />
                                   {gameWinner.name} Won
                                 </span>
                               )}
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                               {/* Player 1 Score */}
                               <div className={`flex items-center justify-between p-3 rounded-lg ${
                                 isP1Winner ? 'bg-neon-blue/10 border border-neon-blue/30' : 'bg-white/5'
                               }`}>
                                 <div className="flex items-center gap-2">
                                   <img src={p1?.image} alt={p1?.name} className="w-8 h-8 rounded-full object-cover" />
                                   <div>
                                     <div className={`text-sm font-bold ${isP1Winner ? 'text-neon-blue' : 'text-gray-400'}`}>
                                       {p1?.name}
                                     </div>
                                     {!isP1Winner && (
                                       <div className="text-[10px] text-gray-500">Lost by {game.scoreP2 - game.scoreP1} points</div>
                                     )}
                                   </div>
                                 </div>
                                 <div className={`text-2xl font-mono font-bold ${isP1Winner ? 'text-white' : 'text-gray-400'}`}>
                                   {game.scoreP1}
                                 </div>
                               </div>
                               
                               {/* Player 2 Score */}
                               <div className={`flex items-center justify-between p-3 rounded-lg ${
                                 !isP1Winner ? 'bg-neon-blue/10 border border-neon-blue/30' : 'bg-white/5'
                               }`}>
                                 <div className="flex items-center gap-2">
                                   <img src={p2?.image} alt={p2?.name} className="w-8 h-8 rounded-full object-cover" />
                                   <div>
                                     <div className={`text-sm font-bold ${!isP1Winner ? 'text-neon-blue' : 'text-gray-400'}`}>
                                       {p2?.name}
                                     </div>
                                     {isP1Winner && (
                                       <div className="text-[10px] text-gray-500">Lost by {game.scoreP1 - game.scoreP2} points</div>
                                     )}
                                   </div>
                                 </div>
                                 <div className={`text-2xl font-mono font-bold ${!isP1Winner ? 'text-white' : 'text-gray-400'}`}>
                                   {game.scoreP2}
                                 </div>
                               </div>
                             </div>
                             
                             {/* Points Difference */}
                             <div className="mt-2 text-center text-xs text-gray-500">
                               Point Difference: <span className="text-white font-bold">{Math.abs(game.scoreP1 - game.scoreP2)}</span> points
                             </div>
                           </motion.div>
                         );
                       })}
                     </div>
                     
                     {/* Match Summary */}
                     <div className="mt-6 pt-4 border-t border-glass-border">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-400">Final Score</span>
                         <div className="flex items-center gap-3">
                           <span className={`font-bold ${match.scoreP1 > match.scoreP2 ? 'text-neon-blue' : 'text-gray-400'}`}>
                             {p1?.name}: {match.scoreP1}
                           </span>
                           <span className="text-gray-600">-</span>
                           <span className={`font-bold ${match.scoreP2 > match.scoreP1 ? 'text-neon-blue' : 'text-gray-400'}`}>
                             {p2?.name}: {match.scoreP2}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
           </div>

           {/* Up Next Sidebar */}
           <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-glass-border bg-dark-surface/30 p-6">
             <h3 className="text-lg font-sans font-black uppercase text-white mb-6">Suggested Matches</h3>
             <div className="space-y-4">
                {recentMatches.map((m) => {
                  const sm_p1 = players.find(p => p.id === m.player1Id);
                  const sm_p2 = players.find(p => p.id === m.player2Id);
                  return (
                    <Link key={m.id} to={`/match/${m.id}`} className="group flex gap-4 items-start">
                      <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative shrink-0 border border-glass-border group-hover:border-neon-blue transition-colors">
                        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: sm_p1 ? `url(${sm_p1.image})` : undefined }} />
                        <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" fill="currentColor" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neon-green font-bold uppercase tracking-wider mb-1">{m.round}</span>
                        <span className="text-sm font-semibold leading-tight line-clamp-2">
                           {sm_p1?.name} vs {sm_p2?.name}
                        </span>
                      </div>
                    </Link>
                  )
                })}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
