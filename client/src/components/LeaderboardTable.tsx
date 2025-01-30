import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { fetchALlInfluencers } from '../store/slices/influencersSlice';


const LeaderboardTable: React.FC = () => {
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const { loading, error } = useSelector((state: RootState) => state.influencers)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(()=>{
    if(!loading && influencers.length === 0){
      //@ts-ignore
      dispatch(fetchALlInfluencers())
    }
  },[dispatch, loading]);

  //console.log(influencers)

  const handleInfluencerClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          <p className="ml-4">{`Fetching Leaderboard...`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0B0F] rounded-lg overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 sm:px-6 py-4 text-left text-sm text-gray-400">RANK</th>
              <th className="px-4 sm:px-6 py-4 text-left text-sm text-gray-400">INFLUENCER</th>
              
              <th className="px-4 sm:px-6 py-4 text-left text-sm text-gray-400">TRUST SCORE</th>
              
              <th className="hidden md:table-cell px-6 py-4 text-left text-sm text-gray-400">FOLLOWERS</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((influencer, index) => (
              <tr
                key={influencer._id}
                className="border-b border-gray-800 cursor-pointer hover:bg-gray-900"
                onClick={() => handleInfluencerClick(influencer.handle)}
              >
                <td className="px-4 sm:px-6 py-4 text-gray-300">#{index + 1}</td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={influencer.avatar}
                      alt={influencer.screen_name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="text-white text-sm sm:text-base">{influencer.handle}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-emerald-500">{influencer.trust_score.toPrecision(2)}%</span>
                </td>
                <td className="hidden md:table-cell px-6 py-4 text-gray-300">{influencer.followers > 1000 ? `${(influencer.followers/1000).toPrecision(4)}k` : influencer.followers }</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardTable