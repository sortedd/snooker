import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Matches } from './pages/Matches';
import { Bracket } from './pages/Bracket';
import { Players } from './pages/Players';
import { MatchDetail } from './pages/MatchDetail';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="matches" element={<Matches />} />
        <Route path="bracket" element={<Bracket />} />
        <Route path="players" element={<Players />} />
        <Route path="match/:id" element={<MatchDetail />} />
        {/* Skipping PlayerDetail for brevity, can be added later */}
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
