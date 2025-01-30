import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Settings, Menu, X } from 'lucide-react';
// import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0A0B0F] border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-emerald-500 font-bold text-xl flex items-center">
            <BarChart2 className="mr-2" />
            <span className="hidden sm:inline">VerifyInfluencers</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex space-x-6">
            <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
            <Link to="/research" className="text-gray-300 hover:text-white">Research</Link>
            <Link to="/analytics" className="text-gray-300 hover:text-white">Analytics</Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* <SearchBar /> */}
            <Settings className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden mt-4 pb-4">
          <div className="flex flex-col space-y-4">
            <Link
              to="/leaderboard"
              className="text-gray-300 hover:text-white px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              to="/research"
              className="text-gray-300 hover:text-white px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Research
            </Link>
            <Link
              to="/analytics"
              className="text-gray-300 hover:text-white px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Analytics
            </Link>
            <div className="pt-2">
              {/* <SearchBar /> */}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar