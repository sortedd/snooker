import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { Play, TrendingUp, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveHero } from '../components/InteractiveHero';

export function Home() {
  const { matches, players } = useTournamentStore();
  
  // Priority 1: Latest match with video (live or completed)
  // Priority 2: Any match with video
  // Priority 3: Latest match overall
  const matchesWithVideos = matches.filter(m => m.videoUrls && m.videoUrls.length > 0);
  const featuredMatch = matchesWithVideos.length > 0 
    ? matchesWithVideos[matchesWithVideos.length - 1] // Get the latest one
    : matches[0];
  
  const getPlayer = (id: string | null) => players.find(p => p.id === id);
  const p1 = getPlayer(featuredMatch.player1Id);
  const p2 = getPlayer(featuredMatch.player2Id);

  // Upcoming matches (without videos)
  const upcomingMatches = matches
    .filter(m => m.status === 'pending' && m.player1Id && m.player2Id && (!m.videoUrls || m.videoUrls.length === 0))
    .slice(0, 3);
  
  // ALL completed matches - show them prominently
  const completedMatches = matches.filter(m => m.status === 'completed').reverse();
  
  // Recommended matches with videos (for sidebar)
  const recommendedMatches = matchesWithVideos
    .filter(m => m.id !== featuredMatch.id)
    .reverse()
    .slice(0, 5);

  return (
    <div className="flex-1 w-full max-w-[2000px] mx-auto pb-20">
      {/* Interactive Hero Section */}
      <InteractiveHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-2 text-white">
              <TrendingUp className="text-neon-blue w-6 h-6" /> Up Next
            </h2>
            <Link to="/matches" className="text-sm font-medium text-neon-blue hover:text-white flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match, i) => {
                const p1 = getPlayer(match.player1Id);
                const p2 = getPlayer(match.player2Id);
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-neon-blue/50 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neon-green font-bold uppercase tracking-wider">{match.round}</span>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex -space-x-4">
                          {p1 && <img src={p1.image} alt={p1.name} className="w-12 h-12 rounded-full border-2 border-[#111] object-cover" />}
                          {p2 && <img src={p2.image} alt={p2.name} className="w-12 h-12 rounded-full border-2 border-[#111] object-cover" />}
                        </div>
                        <div className="font-semibold text-lg">
                          <span className={!p1 ? "text-gray-500" : ""}>{p1?.name || 'TBD'}</span>
                          <span className="mx-2 text-gray-500 text-sm">vs</span>
                          <span className={!p2 ? "text-gray-500" : ""}>{p2?.name || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="font-mono">
                        {new Date(match.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-panel p-8 text-center text-gray-400 rounded-2xl">
                No upcoming matches. The tournament might be over!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-2 text-white">
              <Trophy className="text-neon-green w-6 h-6" /> Match Results
            </h2>
            <span className="text-sm text-gray-400">{completedMatches.length} completed</span>
          </div>
          
          <div className="space-y-4">
            {completedMatches.length > 0 ? (
              completedMatches.map((match, i) => {
                const p1 = getPlayer(match.player1Id);
                const p2 = getPlayer(match.player2Id);
                const isP1Winner = match.winnerId === p1?.id;
                
                return (
                  <Link
                    key={match.id}
                    to={`/match/${match.id}`}
                    className="block glass-panel p-4 rounded-xl flex flex-col gap-3 hover:bg-white/5 hover:border-neon-green/30 transition-all cursor-pointer group"
                  >
                    <div className="text-xs text-gray-500 uppercase flex justify-between">
                      <span>{match.round}</span>
                      <span className="text-neon-green">Completed</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between ${isP1Winner ? 'text-white font-bold' : 'text-gray-400'}`}>
                        <div className="flex items-center gap-2">
                          <img src={p1?.image} alt={p1?.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="truncate max-w-[150px]">{p1?.name}</span>
                          {isP1Winner && <Trophy className="w-3 h-3 text-neon-green" />}
                        </div>
                        <span className="text-lg font-mono tracking-tighter font-bold">{match.scoreP1}</span>
                      </div>
                      
                      <div className={`flex items-center justify-between ${!isP1Winner ? 'text-white font-bold' : 'text-gray-400'}`}>
                        <div className="flex items-center gap-2">
                          <img src={p2?.image} alt={p2?.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="truncate max-w-[150px]">{p2?.name}</span>
                          {!isP1Winner && <Trophy className="w-3 h-3 text-neon-green" />}
                        </div>
                        <span className="text-lg font-mono tracking-tighter font-bold">{match.scoreP2}</span>
                      </div>
                    </div>

                    {/* Game breakdown */}
                    {match.games && match.games.length > 0 && (
                      <div className="pt-2 border-t border-glass-border mt-2">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Games:</div>
                        <div className="flex gap-1 flex-wrap">
                          {match.games.map((game) => {
                            const gameWinner = game.winnerId === p1?.id ? 'p1' : 'p2';
                            return (
                              <span
                                key={game.gameNumber}
                                className={`text-[10px] px-2 py-1 rounded ${
                                  gameWinner === 'p1' 
                                    ? 'bg-neon-blue/20 text-neon-blue' 
                                    : 'bg-purple-500/20 text-purple-400'
                                }`}
                              >
                                G{game.gameNumber}: {gameWinner === 'p1' ? p1?.name : p2?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="glass-panel p-6 text-center text-gray-400 rounded-xl text-sm">
                No completed matches yet.
              </div>
            )}
          </div>
          
          {/* Recommended Videos Section */}
          {recommendedMatches.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-4">
                <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-2 text-white">
                  <Play className="text-neon-blue w-6 h-6 fill-current" /> Recommended Videos
                </h2>
                <Link to="/matches" className="text-sm font-medium text-neon-blue hover:text-white flex items-center gap-1 transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {recommendedMatches.map((match) => {
                  const rp1 = getPlayer(match.player1Id);
                  const rp2 = getPlayer(match.player2Id);
                  
                  return (
                    <Link
                      key={match.id}
                      to={`/match/${match.id}`}
                      className="block glass-panel p-3 rounded-xl hover:bg-white/5 hover:border-neon-blue/30 transition-all group"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-dark-surface">
                          {rp1 && rp2 ? (
                            <div className="flex h-full">
                              <div className="w-1/2"><img src={rp1.image} className="w-full h-full object-cover" /></div>
                              <div className="w-1/2"><img src={rp2.image} className="w-full h-full object-cover" /></div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-dark-surface" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 rounded">
                            {match.videoUrls?.length}
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="text-[10px] text-neon-green font-bold uppercase mb-1">{match.round}</div>
                            <div className="text-sm font-semibold truncate">
                              {rp1?.name || 'TBD'} vs {rp2?.name || 'TBD'}
                            </div>
                          </div>
                          {match.status === 'completed' && (
                            <div className="text-xs text-gray-400">
                              Score: {match.scoreP1} - {match.scoreP2}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
