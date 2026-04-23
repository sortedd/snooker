import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { Trophy, TrendingDown, Target, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Players() {
  const { players } = useTournamentStore();

  const sortedPlayers = [...players].sort((a, b) => a.seed - b.seed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-tighter text-white mb-2">The Contenders</h1>
        <p className="text-gray-400">Top 16 players battling for the championship.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedPlayers.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/player/${player.id}`} className={cn(
              "group block relative overflow-hidden rounded-2xl glass-panel p-6 transition-all duration-300 hover:-translate-y-2",
              !player.isActive ? "opacity-60 grayscale hover:grayscale-0" : "hover:border-neon-blue/50"
            )}>
              {/* Seed badge */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-dark-surface border border-glass-border flex items-center justify-center font-bold text-xs text-gray-400 z-10 group-hover:text-neon-blue group-hover:border-neon-blue mt-0 transition-colors">
                 #{player.seed}
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full overflow-hidden border-2 p-1 transition-colors",
                    player.isActive ? "border-neon-blue" : "border-glass-border"
                  )}>
                    <img src={player.image} alt={player.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  {!player.isActive && (
                    <div className="absolute -bottom-2 -right-2 bg-red-500/20 text-red-500 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-red-500/50 backdrop-blur-sm">
                      Eliminated
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold uppercase tracking-wide group-hover:text-neon-blue transition-colors">{player.name}</h3>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-glass-border">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> M</span>
                    <span className="font-bold text-lg">{player.matchesPlayed}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-neon-green text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Trophy className="w-3 h-3"/> W</span>
                    <span className="font-bold text-lg">{player.wins}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-red-400 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> L</span>
                    <span className="font-bold text-lg">{player.losses}</span>
                  </div>
                </div>
              </div>
              
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
