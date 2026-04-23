import { useTournamentStore } from '../store/useTournamentStore';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Match, Player } from '../data/initialData';
import { Link } from 'react-router-dom';
import { Play, Circle } from 'lucide-react';

function MatchNode({ match, players, isFinal }: { match?: Match, players: Player[], isFinal?: boolean }) {
  if (!match) return <div className="hidden"></div>;

  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  const getPlayerDisplay = (p?: Player, score?: number, isWinner?: boolean) => {
    return (
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b border-glass-border last:border-b-0",
        p ? "" : "opacity-30",
        isWinner ? "bg-neon-blue/20 text-white" : ""
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          {p ? (
            <img src={p.image} alt={p.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-dark-surface shrink-0" />
          )}
          <span className={cn(
            "text-xs font-medium truncate", 
            isWinner ? "text-neon-blue font-bold" : "text-gray-300"
          )}>
            {p?.name || 'TBD'}
          </span>
          {isWinner && <span className="text-[8px] text-neon-green ml-1">✓</span>}
        </div>
        <span className={cn(
          "text-xs font-mono tracking-tighter font-bold w-6 text-center shrink-0", 
          isWinner ? "text-white text-base" : score > 0 ? "text-neon-blue" : "text-gray-500"
        )} title={score > 0 ? `${score} frame${score !== 1 ? 's' : ''} won` : ''}>
          {score !== undefined && (match.status === 'completed' || score > 0) ? score : '-'}
        </span>
      </div>
    );
  };

  return (
    <Link to={`/match/${match.id}`} className={cn(
      "block w-48 xl:w-56 glass-panel rounded-lg overflow-hidden relative group transition-all cursor-pointer",
      isFinal ? "w-56 xl:w-64 border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "",
      match.status === 'completed' 
        ? "border-neon-green/50 hover:border-neon-green shadow-[0_0_10px_rgba(74,222,128,0.2)] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]" 
        : match.videoUrls && match.videoUrls.length > 0
        ? "border-neon-blue/50 hover:border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
        : "hover:border-neon-blue/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]"
    )}>
      {/* Video Available Badge */}
      {match.videoUrls && match.videoUrls.length > 0 && (
        <div className="absolute top-1 left-1 z-20 bg-neon-blue/90 text-black text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <Play className="w-2 h-2 fill-current" />
          VIDEO
        </div>
      )}
      
      {isFinal && (
        <div className="bg-neon-blue/20 text-neon-blue text-[10px] font-bold text-center py-1 uppercase tracking-wider relative z-10">
          Championship Title
        </div>
      )}
      <div className="relative z-10 bg-black/50 group-hover:bg-black/70 transition-colors">
        {getPlayerDisplay(p1, match.scoreP1, match.winnerId === p1?.id)}
        {getPlayerDisplay(p2, match.scoreP2, match.winnerId === p2?.id)}
      </div>
      
      {/* Hover overlay with play icon for matches with videos */}
      {match.videoUrls && match.videoUrls.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          <div className="bg-neon-blue/90 rounded-full p-3 shadow-lg">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      {match.status === 'pending' && match.player1Id && match.player2Id && match.games.length > 0 && (
         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] z-20" title="In Progress" />
      )}
      {match.status === 'pending' && match.player1Id && match.player2Id && match.games.length === 0 && (
         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] z-20" title="Upcoming" />
      )}
      {match.status === 'completed' && (
         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(74,222,128,0.8)] z-20" title="Completed" />
      )}
      {match.status === 'live' && (
         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-20 animate-pulse" title="Live" />
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
        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-gray-400 text-sm mt-2"
        >
          Click on any match to view details and watch videos
        </motion.p>
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
