import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Trophy, Tv, Users, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Live & Home', path: '/', icon: Tv },
    { name: 'Matches', path: '/matches', icon: LayoutDashboard },
    { name: 'Bracket', path: '/bracket', icon: Trophy },
    { name: 'Players', path: '/players', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-dark-bg">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[20%] w-[50vw] h-[50vw] bg-neon-blue/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-neon-green/10 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-glass-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black border border-neon-blue/50 group-hover:border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300">
                <div className="w-4 h-4 bg-white rounded-full relative z-10" />
                {/* Snooker ball reflection */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/50 rounded-full blur-[1px] z-20" />
              </div>
              <span className="font-display font-black text-xl uppercase tracking-widest text-white">
                Ace Snooker
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute inset-0 border border-neon-blue/50 bg-neon-blue/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </span>
                </Link>
              ))}
              
              <div className="w-px h-6 bg-glass-border mx-2" />
              <Link to="/admin" className="p-2 text-gray-400 hover:text-neon-green transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex flex-row items-center gap-4">
              <Link to="/admin" className="p-2 text-gray-400 hover:text-neon-green transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neon-blue"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 glass-panel border-b border-glass-border md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium",
                    location.pathname === item.path
                      ? "bg-neon-blue/10 text-white border border-neon-blue/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-neon-blue" : "text-gray-400")} />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-16 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
