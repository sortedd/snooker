import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Match, Player } from '../data/initialData';
import { Link } from 'react-router-dom';

function MatchNode({ match, players, isFinal }: { match?: Match, players: Player[], isFinal?: boolean }) {
  if (!match) return <div className="hidden"></div>;

  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  const getPlayerDisplay = (p?: Player, score?: number, isWinner?: boolean) => {
    return (
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b border-glass-border last:border-b-0",
        p ? "" : "opacity-30",
        isWinner ? "bg-neon-blue/10 text-white" : ""
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          {p ? (
            <img src={p.image} alt={p.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-dark-surface shrink-0" />
          )}
          <span className={cn("text-xs font-medium truncate", isWinner ? "text-neon-blue" : "text-gray-300")}>
            {p?.name || 'TBD'}
          </span>
        </div>
        <span className={cn("text-xs font-mono tracking-tighter font-bold w-4 text-center shrink-0", isWinner ? "text-white" : "text-gray-500")}>
          {score !== undefined && match.status === 'completed' ? score : '-'}
        </span>
      </div>
    );
  };

  return (
    <Link to={`/match/${match.id}`} className={cn(
      "w-48 xl:w-56 glass-panel rounded-lg overflow-hidden relative group hover:border-neon-blue/50 transition-all",
      isFinal ? "w-56 xl:w-64 border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : ""
    )}>
      {isFinal && (
        <div className="bg-neon-blue/20 text-neon-blue text-[10px] font-bold text-center py-1 uppercase tracking-wider relative z-10">
          Championship Title
        </div>
      )}
      <div className="relative z-10 bg-black/50">
        {getPlayerDisplay(p1, match.scoreP1, match.winnerId === p1?.id)}
        {getPlayerDisplay(p2, match.scoreP2, match.winnerId === p2?.id)}
      </div>
      
      {/* Pending status indicator */}
      {match.status === 'pending' && match.player1Id && match.player2Id && (
         <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] z-20" />
      )}
    </Link>
  );
}

export function Bracket() {
  const { matches, players } = useTournamentStore();

  const getMatchesByRound = (roundSequence: number) => {
    return matches.filter(m => m.roundSequence === roundSequence).sort((a, b) => a.matchSequenceInRound - b.matchSequenceInRound);
  };

  const r16 = getMatchesByRound(1);
  const qf = getMatchesByRound(2);
  const sf = getMatchesByRound(3);
  const final = getMatchesByRound(4);

  return (
    <div className="flex-1 w-full flex flex-col bg-[#050505]">
      <div className="px-6 py-8 md:px-12 border-b border-glass-border">
        <motion.h1 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tighter"
        >
          Tournament <span className="text-neon-blue">Bracket</span>
        </motion.h1>
      </div>

      {/* Bracket container with horizontal scrolling for mobile */}
      <div className="flex-1 overflow-x-auto min-h-[600px] p-6 md:p-12">
        <div className="min-w-[1000px] h-full flex justify-between select-none">
          
          {/* Round of 16 */}
          <div className="flex flex-col justify-around h-full gap-4 relative z-10 w-48 xl:w-56">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 absolute -top-8 w-full text-center">Round of 16</h3>
            {r16.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                 <MatchNode match={m} players={players} />
                 {/* Connecting lines */}
                 <div className="hidden lg:block absolute w-8 border-t border-glass-border top-1/2 -right-8" />
                 {i % 2 === 0 ? (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border top-1/2 -right-8 h-[calc(50%+1rem)]" />
                 ) : (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border bottom-1/2 -right-8 h-[calc(50%+1.5rem)]" />
                 )}
              </motion.div>
            ))}
          </div>

          {/* Quarter Finals */}
          <div className="flex flex-col justify-around h-full relative z-10 w-48 xl:w-56">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 absolute -top-8 w-full text-center">Quarter Finals</h3>
            {qf.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="relative">
                <MatchNode match={m} players={players} />
                 {/* Forward lines */}
                 <div className="hidden lg:block absolute w-12 border-t border-glass-border top-1/2 -right-12" />
                 {i % 2 === 0 ? (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border top-1/2 -right-12 h-[calc(100%+0.5rem)]" />
                 ) : (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border bottom-1/2 -right-12 h-[calc(100%+0.5rem)]" />
                 )}
              </motion.div>
            ))}
          </div>

          {/* Semi Finals */}
          <div className="flex flex-col justify-around h-full relative z-10 w-48 xl:w-56">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 absolute -top-8 w-full text-center">Semi Finals</h3>
            {sf.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="relative">
                 <MatchNode match={m} players={players} />
                 {/* Forward lines */}
                 <div className="hidden lg:block absolute w-16 border-t border-glass-border top-1/2 -right-16" />
                 {i % 2 === 0 ? (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border top-1/2 -right-16 h-[calc(220%)]" />
                 ) : (
                   <div className="hidden lg:block absolute w-[1px] bg-glass-border bottom-1/2 -right-16 h-[calc(220%)]" />
                 )}
              </motion.div>
            ))}
          </div>

          {/* Final */}
          <div className="flex flex-col justify-center h-full relative z-10 w-56 xl:w-64">
            <h3 className="text-[10px] font-bold text-neon-blue uppercase tracking-widest mb-4 absolute -top-8 w-full text-center glow">Final</h3>
            {final.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="relative">
                <div className="hidden lg:block absolute w-16 border-t border-glass-border top-1/2 -left-16" />
                <MatchNode match={m} players={players} isFinal />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
