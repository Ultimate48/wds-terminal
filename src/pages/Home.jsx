import React, { createContext, useState, useEffect } from 'react';
import Stocks from './components/Stocks';
import RoundNews from './components/newsfetch';
import PinBoard from './components/PinBoard';
import { BookOpen } from 'lucide-react';
import econLogo from './assets/Econ(White).png';
import wdsLogo from './assets/wdslogo.png';

export const SelectedStocksContext = createContext();

function Home() {
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedCryptos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedCryptos(parsed);
        }
      } catch (e) {
        console.error("Error reading saved stocks:", e);
      }
    }
    setInitialized(true);
  }, []);

  const updateSelectedCryptos = (newSelection) => {
    setSelectedCryptos(newSelection);
    localStorage.setItem("selectedCryptos", JSON.stringify(newSelection));
  };

  if (!initialized) {
    return (
      <div className="w-screen h-screen bg-[#0E0E10] flex items-center justify-center">
        <p className="text-zinc-400 text-sm font-medium">Loading exchange...</p>
      </div>
    );
  }

  return (
    <SelectedStocksContext.Provider value={{ selectedCryptos, updateSelectedCryptos }}>
      <div className="min-h-screen w-full bg-[#0E0E10] text-zinc-100 selection:bg-red-700 selection:text-white">
        
        {/* Top Header with Econ & WDS Logos */}
        <header className="border-b border-zinc-800 bg-[#121215]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Top Left: First Econ, then | separator, then WDS */}
            <div className="flex items-center gap-3">
              <img
                src={econLogo}
                alt="Econ"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="text-zinc-600 text-lg font-light select-none">|</span>
              <img
                src={wdsLogo}
                alt="WDS"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

            {/* Top Right: RuleBook Action */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/p/DgAL5x7ER5a/?jplx=MWthNGVwYTVtaGR6Ng=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>RuleBook</span>
              </a>
            </div>

          </div>
        </header>

        {/* PinBoard (Watchlist) */}
        <PinBoard />

        {/* Round News Feed */}
        <RoundNews />

        {/* Master Stock & Circuit Table */}
        <Stocks />

        {/* Clean Footer */}
        <footer className="border-t border-zinc-800/80 bg-[#121215] py-6 text-center text-xs text-zinc-500">
          <p className="text-zinc-400 font-semibold">WOLF OF DALAL STREET | ECON</p>
        </footer>

      </div>
    </SelectedStocksContext.Provider>
  );
}

export default Home;
