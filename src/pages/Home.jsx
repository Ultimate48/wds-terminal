import React, { createContext, useState, useEffect } from 'react';
import Econ from './assets/ec.png';
import NewsBox from './components/NewsBox';
import Stocks from './components/Stocks';
import RoundNews from './components/newsfetch';
import PinBoard from './components/PinBoard';


export const SelectedStocksContext = createContext();

function Home() {
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [initialized, setInitialized] = useState(false);

  
  useEffect(() => {
    const saved = localStorage.getItem("selectedCryptos");
    
    if (saved) {
      
      setSelectedCryptos(JSON.parse(saved));
    } else {
      
      const allStocks = [
        "Ixigo", "CAMS", "Coforge", "Power Grid Corp", "Max Healthcare", 
        "Ashok Leyland", "Page Industries", "Godrej Properties", "Granules India", 
        "Balrampur Chini Mills", "Redington", "ONGC", "Divi's Laboratories", 
        "Muthoot Finance", "Polycab India", "Supreme Industries", "Tube Investments", 
        "Trident", "Gokaldas Exports", "HCL Technologies", "Cipla", "Lupin", 
        "Dabur India", "Mankind Pharma", "Bharat Petroleum", "Biocon", "Uno Minda", 
        "EMS Limited", "UltraTech Cement", "Tech Mahindra", "Blue Star", 
        "Hindustan Zinc", "Blue Dart Express", "Motilal Oswal Financial Services", 
        "Bosch", "West Coast Paper Mills", "Life Insurance Corporation of India", 
        "Hindalco Industries", "HDFC Life Insurance", "Zydus Lifesciences"
      ];
      
      const shuffled = [...allStocks].sort(() => 0.5 - Math.random());
      const random10 = shuffled.slice(0, 10);
      
      setSelectedCryptos(random10);
      localStorage.setItem("selectedCryptos", JSON.stringify(random10));
      
      console.log("✅ First visit! Selected 10 random stocks:", random10);
    }
    
    setInitialized(true);
  }, []);

  
  const updateSelectedCryptos = (newSelection) => {
    setSelectedCryptos(newSelection);
    localStorage.setItem("selectedCryptos", JSON.stringify(newSelection));
  };

  if (!initialized) {
    return (
      <div className='w-screen h-screen bg-[#0B091A] flex items-center justify-center'>
        <p className='text-white text-xl'>Loading...</p>
      </div>
    );
  }

  return (
    <SelectedStocksContext.Provider value={{ selectedCryptos, updateSelectedCryptos }}>
      <div className='w-screen h-full bg-[#0B091A] overflow-x-hidden relative'>
        {/* RuleBook Link */}
        <a 
          href='https://www.instagram.com/p/DQzJ5COj493/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==' 
          target='_blank' 
          rel='noopener noreferrer'
          className='absolute pt-[3%] md:pt-[6%] right-0 pr-[6%] text-lg md:text-4xl text-white DMSans font-bold'
        >
          RuleBook
        </a>
        
        {/* Main Content */}
        <img src={Econ} alt='Econ' className='w-[20%] h-auto pt-[0.3%] pl-[0.5%]' />
        <PinBoard />
        <RoundNews /> {/* Render NewsBox which will fetch and display round 1 news */}
        <Stocks />
      </div>
    </SelectedStocksContext.Provider>
  );
}

export default Home;
