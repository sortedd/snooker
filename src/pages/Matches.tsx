import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { Play, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Matches() {
  const { matches, players } = useTournamentStore();

  const getPlayer = (id: string | null) => players.find(p => p.id === id);

  // Group by round
  const rounds = [
    { name: 'Final', matches: matches.filter(m => m.round === 'Final') },
    { name: 'Semi Finals', matches: matches.filter(m => m.round === 'Semi Finals') },
    { name: 'Quarter Finals', matches: matches.filter(m => m.round === 'Quarter Finals') },
    { name: 'Round of 16', matches: matches.filter(m => m.round === 'Round of 16') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-tighter text-white mb-2">Match Library</h1>
        <p className="text-gray-400">All tournament replays and upcoming fixtures.</p>
      </motion.div>

      <div className="space-y-16">
        {rounds.map((roundGroup) => (
          <div key={roundGroup.name}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-sans font-black uppercase whitespace-nowrap text-white">{roundGroup.name}</h2>
              <div className="w-full h-[1px] bg-glass-border"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {roundGroup.matches.map((match, i) => {
                const p1 = getPlayer(match.player1Id);
                const p2 = getPlayer(match.player2Id);
                const isPlaceholder = !p1 || !p2;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/match/${match.id}`}
                      className={`block group relative aspect-video rounded-xl overflow-hidden glass-panel ${
                        isPlaceholder ? 'pointer-events-none opacity-50 block' : ''
                      }`}
                    >
                      {/* Thumbnail background logic */}
                      <div className="absolute inset-0 bg-dark-surface">
                        {p1 && p2 && (
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full"><img src={p1.image} className="w-full h-full object-cover blur-sm opacity-30" /></div>
                            <div className="w-1/2 h-full"><img src={p2.image} className="w-full h-full object-cover blur-sm opacity-30" /></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end">
                        {!isPlaceholder && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-neon-blue/80 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            <Play className="w-5 h-5 fill-current ml-1" />
                          </div>
                        )}
                        
                        <div className="relative z-10 flex flex-col gap-1 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                          {match.status === 'completed' && (
                            <span className="text-[#39ff14] text-[10px] font-bold uppercase tracking-wider mb-1 line-clamp-1">
                              Result: {match.scoreP1} - {match.scoreP2} {p1?.id === match.winnerId ? `(${p1?.name})` : p2?.id === match.winnerId ? `(${p2?.name})` : ''}
                            </span>
                          )}
                          <div className="font-bold text-sm md:text-base leading-tight">
                            <span className="block truncate">{p1?.name || 'TBD'}</span>
                            <span className="text-gray-400 text-xs italic mx-1 block">vs</span>
                            <span className="block truncate">{p2?.name || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                            <Clock className="w-3 h-3" />
                            {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
