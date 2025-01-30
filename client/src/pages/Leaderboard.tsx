import React from 'react';
import LeaderboardTable from '../components/LeaderboardTable';

const Leaderboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Influencer Trust Leaderboard</h1>
        <p className="text-gray-400">Real-time rankings of health influencers based on scientific accuracy, credibility, and transparency.</p>
      </div>
      <LeaderboardTable />
    </div>
  );
}

export default Leaderboard;