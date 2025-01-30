import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Leaderboard from './pages/Leaderboard';
import Research from './pages/Research';
import Profile from './pages/Profile';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-[#0A0B0F]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/research" element={<Research />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;