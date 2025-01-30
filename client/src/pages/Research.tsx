import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Key, Settings2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { searchOrAddInfluencer } from '../store/slices/influencersSlice';
import { useNavigate } from 'react-router-dom';

const Research: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [claimsCount, setClaimsCount] = useState('0');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //@ts-ignore
    dispatch(searchOrAddInfluencer({influencer, apiKey, claimsCount}));
    navigate(`/profile/${influencer}`)
  };

  return (
    <div className="p-6">
      {/* Main Research Configuration */}
      <div className="bg-[#0A0B0F] rounded-lg p-6 border border-gray-800 shadow-lg">
        <div className="flex items-center mb-6">
          <Settings2 className="text-emerald-500 mr-3" size={24} />
          <h2 className="text-xl font-bold text-white">Research Configuration</h2>
        </div>
        <div className="mb-6 bg-[#1A1B1F] rounded-lg border border-gray-800 p-4">
          <div className="flex items-center mb-3">
            <Info className="text-emerald-500 mr-2" size={18} />
            <h3 className="text-white font-medium">Research Guidelines</h3>
          </div>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-2 mr-3"></div>
              <span>By default, the system analyzes the most recent 100 posts from the influencer's profile</span>
            </li>
            <li className="flex items-start">
              <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-2 mr-3"></div>
              <span>Initial verification is limited to 10 claims. For additional claims, provide your Perplexity API key in the Advanced Configuration section</span>
            </li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1A1B1F] rounded-lg p-6 border border-gray-800">
            <label className="block text-gray-400 mb-2 font-medium">Specific Influencer</label>
            <input
              type="text"
              value={influencer}
              onChange={(e) => setInfluencer(e.target.value)}
              className="w-full bg-[#0A0B0F] border border-gray-800 rounded-md px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="Research a known health influencer by their twitter handle"
            />
            <p className='text-gray-500 text-sm'>**Please make sure the username or handle is correct</p>
          </div>

          {/* Advanced Configuration */}
          <div className="bg-[#1A1B1F] rounded-lg border border-gray-800">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center">
                <Key className="text-emerald-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Advanced Configuration
                  <span className="ml-2 text-sm font-normal text-gray-400">(optional)</span>
                </h3>
              </div>
              {isAdvancedOpen ? (
                <ChevronUp className="text-gray-400" size={20} />
              ) : (
                <ChevronDown className="text-gray-400" size={20} />
              )}
            </button>
            
            {isAdvancedOpen && (
              <div className="p-6 space-y-4 border-t border-gray-800">
                <div>
                  <label className="block text-gray-400 mb-2">Perplexity API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#0A0B0F] border border-gray-800 rounded-md px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="Enter your Perplexity API key"
                  />
                  <p className="mt-1 text-sm text-gray-500">Your API key will be securely stored and encrypted</p>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Number of Claims to Verify (recommended to analyze more than 50 claims for more accurate results)</label>
                  <input
                    type="number"
                    value={claimsCount}
                    onChange={(e) => setClaimsCount(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full bg-[#0A0B0F] border border-gray-800 rounded-md px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="Enter number of claims"
                  />
                  <p className="mt-1 text-sm text-gray-500">Maximum 100 claims per research task</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 text-white px-8 py-3 rounded-md hover:bg-emerald-600 transition-colors duration-200 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Start Research
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Research;