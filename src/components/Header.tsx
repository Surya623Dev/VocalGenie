import React from 'react';
import { Music, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative z-20 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                VocalGenie
              </h1>
              <p className="text-sm text-gray-400">AI-Powered Vocal Magic</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Free & Open Source</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium">
              Pro Features Coming Soon
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;