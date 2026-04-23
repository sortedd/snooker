import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { Play, TrendingUp, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { matches, players } = useTournamentStore();
  
  // Find the latest active or completed match with a video
  const featuredMatch = [...matches].reverse().find(m => m.videoUrls && m.videoUrls.length > 0) || matches[0];
  
  const getPlayer = (id: string | null) => players.find(p => p.id === id);
  const p1 = getPlayer(featuredMatch.player1Id);
  const p2 = getPlayer(featuredMatch.player2Id);

  // Upcoming matches
  const upcomingMatches = matches.filter(m => m.status === 'pending' && m.player1Id && m.player2Id).slice(0, 3);
  
  // Recent results
  const recentMatches = matches.filter(m => m.status === 'completed').reverse().slice(0, 3);

  return (
    <div className="flex-1 w-full max-w-[2000px] mx-auto pb-20">
      {/* Hero Section */}
      <section className="relative w-full min-h-[75svh] md:min-h-[60vh] max-h-[85vh] bg-black overflow-hidden flex flex-col justify-end">
        {/* Ambient 4K Cinematic Snooker Background (Replaces fragile YouTube iframe) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              x: ['0%', '-1%', '0%'],
              y: ['0%', '1%', '0%']
            }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 w-full h-full"
          >
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1615886616086-4f40f0c05b82?q=80&w=2940&auto=format&fit=crop)' }}
            />
          </motion.div>
          {/* Subtle vignette and gradient overlays for that "Sexy" dark broadcast look */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/90 via-dark-bg/20 to-transparent" />
          <div className="absolute inset-0 bg-neon-blue/5 mix-blend-overlay" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-20 max-w-7xl mx-auto w-full mb-8 md:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4 max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-neon-blue/20 text-neon-blue border border-neon-blue/40 rounded-full backdrop-blur-md">
                Featured Match
              </span>
              <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(featuredMatch.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-black italic uppercase tracking-tighter leading-[0.9]">
              <span className="block">{p1?.name || 'TBD'}</span>
              <span className="block text-neon-blue my-2 text-3xl md:text-4xl">VS</span>
              <span className="block">{p2?.name || 'TBD'}</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light mt-2">
              {featuredMatch.round}
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to={`/match/${featuredMatch.id}`}
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-neon-blue hover:text-white transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Link>
              <Link
                to="/bracket"
                className="flex items-center gap-2 glass-panel text-white px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 transition-all"
              >
                View Bracket
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
              <Trophy className="text-neon-green w-6 h-6" /> Recent Results
            </h2>
          </div>
          
          <div className="space-y-4">
            {recentMatches.length > 0 ? (
              recentMatches.map((match, i) => {
                const p1 = getPlayer(match.player1Id);
                const p2 = getPlayer(match.player2Id);
                const isP1Winner = match.winnerId === p1?.id;
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-4 rounded-xl flex flex-col gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="text-xs text-gray-500 uppercase flex justify-between">
                      <span>{match.round}</span>
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
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-panel p-6 text-center text-gray-400 rounded-xl text-sm">
                No completed matches yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
