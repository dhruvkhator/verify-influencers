import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RootState } from '../store';
import { Influencer } from '../types';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const influencers = useSelector((state: RootState) => state.influencers.list);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectInfluencer = (influencer: Influencer) => {
    navigate(`/profile/${influencer.id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full lg:w-64" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search influencers..."
          className="w-full bg-[#1A1B1F] border border-gray-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {isOpen && query && (
        <div className="absolute z-50 w-full mt-2 bg-[#1A1B1F] border border-gray-800 rounded-md shadow-lg">
          {filteredInfluencers.length > 0 ? (
            filteredInfluencers.map(influencer => (
              <div
                key={influencer.id}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSelectInfluencer(influencer)}
              >
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <div className="text-white">{influencer.name}</div>
                  <div className="text-sm text-gray-400">{influencer.category}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar