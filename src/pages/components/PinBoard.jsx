// PinBoard.jsx
import React, { useState, useEffect, useContext } from "react";
import { db } from "./firebase"; 
import { doc, getDoc } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { SelectedStocksContext } from '../Home';
import abbotImg from "../assets/Abbott.png"; 
import adaniImg from "../assets/Adani.jpeg";
import BhEleImg from "../assets/Bharat electronics.png";
import brightImg from "../assets/Brightcorp.jpeg";
import cianImg from "../assets/cian agro.png";
import dataImg from "../assets/datapatterns.png";
import decaImg from "../assets/Decathlon.jfif";
import dixonImg from "../assets/Dixon.jpg";
import dlfImg from "../assets/DLF.png";
import dmartImg from "../assets/Dmart.png";
import drImg from "../assets/Dr.reddys.jpeg";
import eternalImg from "../assets/Eternal.jpeg";
import hdfcImg from "../assets/HDFC Bank.jpeg";
import hindImg from "../assets/Hindustan_Aeronautics_Limited_Logo.png";
import iciciImg from "../assets/icici prudential.webp";
import iexImg from "../assets/IEX.jpeg";
import inoxImg from "../assets/INOX.jpeg";
import jioImg from "../assets/Jio.jpeg";
import jswImg from "../assets/JSW.jpeg";
import larsenImg from "../assets/Larsen and Toubro.jpeg";
import laveriImg from "../assets/Laveri.jpeg";
import mcxImage from "../assets/MCX.jpeg";
import nipponImg from "../assets/Nippon india.png";
import rattanImg from "../assets/RattanIndia.jpeg";
import rrpImg from "../assets/RRP.jfif";
import suzlonImg from "../assets/Suzlon.jpeg";
import tatachemImg from "../assets/Tata_Chemicals_Limited_-_Logo.png";
import tatamotorsImg from "../assets/Tata_motors.png";
import tcsImg from "../assets/Tata_Consultancy_Services.png";
import tridentImg from "../assets/Trident.jpeg";
import jioSaavnImg from "../assets/Jio_Saavn.jpg";

const INITIAL_STOCKS = [
  { name: "MCX", currentPrice: 9003.5, image: mcxImage },
  { name: "IEX", currentPrice: 147.05, image: iexImg },
  { name: "HDFC Bank", currentPrice: 998.15, image: hdfcImg },
  { name: "JSW Steel", currentPrice: 1141.4, image: jswImg },
  { name: "PVR INOX", currentPrice: 1161, image: inoxImg },
  { name: "Dr. Reddy's Laboratories", currentPrice: 1283.6, image: drImg },
  { name: "Trident", currentPrice: 28.59, image: tridentImg },
  { name: "Eternal", currentPrice: 329.35, image: eternalImg },
  { name: "Jio Financial Service Ltd", currentPrice: 305.95, image: jioImg },
  { name: "Adani Ports", currentPrice: 1429, image: adaniImg },
  { name: "Larsen & Toubro", currentPrice: 3904.9, image: larsenImg },
  { name: "U. H. Zaveri Ltd.", currentPrice: 14.4, image: laveriImg },
  { name: "Brightcom Group Ltd", currentPrice: 13.37, image: brightImg },
  { name: "Suzlon Energy", currentPrice: 53.82, image: suzlonImg },
  { name: "RattanIndia Power Ltd", currentPrice: 11.11, image: rattanImg },
  { name: "DMart (Avenue Supermarts)", currentPrice: 4213.9, image: dmartImg },
  { name: "Hindustan Aeronautics Ltd", currentPrice: 4814.2, image: hindImg },
  { name: "Data Patterns", currentPrice: 2798.7, image: dataImg },
  { name: "Bharat Electronics Ltd", currentPrice: 422.05, image: BhEleImg },
  { name: "Tata Chemicals", currentPrice: 899.85, image: tatachemImg },
  { name: "TCS", currentPrice: 3063.2, image: tcsImg },
  { name: "Decathlon India", currentPrice: 2163.1, image: decaImg },
  { name: "Nippon India ETF Gold BeES", currentPrice: 100.42, image: nipponImg },
  { name: "ICICI Prudential Silver ETF", currentPrice: 144.62, image: iciciImg },
  { name: "DLF", currentPrice: 772.45, image: dlfImg },
  { name: "Abbott India", currentPrice: 29930, image: abbotImg },
  { name: "RRP Semiconductor", currentPrice: 10673.65, image: rrpImg },
  { name: "Dixon Technologies", currentPrice: 15617, image: dixonImg },
  { name: "Cian Agro", currentPrice: 2071.95, image: cianImg },
  { name: "Tata motors passenger veh.", currentPrice: 679.4, image: tatamotorsImg },
  { name: "Jio Saavn", currentPrice: 155, image: jioSaavnImg },
];

function RoundNews() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const rtdbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://wds12-a506f-default-rtdb.asia-southeast1.firebasedatabase.app";
        let currentRound = null;
        if (rtdbUrl) {
          const ctrlRes = await fetch(`${rtdbUrl}/news_control/currentRound.json`);
          if (ctrlRes.ok) {
            const ctrlData = await ctrlRes.json();
            if (ctrlData && typeof ctrlData.round === "number") {
              currentRound = ctrlData.round;
            }
          }
        }
        if (currentRound === null && db) {
          const controlDocRef = doc(db, "news_control", "currentRound");
          const controlDocSnap = await getDoc(controlDocRef);
          if (controlDocSnap.exists()) {
            const r = controlDocSnap.data().round;
            currentRound = typeof r === "number" ? r : 0;
          }
        }

        if (currentRound === 0) {
          setNews(["Game is about to start. Prepare your portfolio!"]);
          return;
        }

        if (typeof currentRound === "number" && currentRound > 0) {
          if (rtdbUrl) {
            const newsRes = await fetch(`${rtdbUrl}/news/round_${currentRound}.json`);
            if (newsRes.ok) {
              const data = await newsRes.json();
              if (data && Array.isArray(data.news)) {
                setNews(data.news);
                return;
              }
            }
          }
          if (db) {
            const roundDocRef = doc(db, "news", `round_${currentRound}`); 
            const roundDocSnap = await getDoc(roundDocRef);
            if (roundDocSnap.exists()) {
              setNews(roundDocSnap.data().news || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 4000);
    return () => clearInterval(interval);
  }, []); 
  return news;
}

const PinBoard = () => {
  const { selectedCryptos, updateSelectedCryptos } = useContext(SelectedStocksContext);  
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCrypto, setHoveredCrypto] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);

  const sheetUrl = "https://docs.google.com/spreadsheets/d/1yqcN9407uqN7gB202A-k0pVVqDr_uvKOEQvuU7RO9zQ/gviz/tq?tqx=out:json&headers=1";
  const removeStock = (stockName) => {
    const updated = selectedCryptos.filter(name => name !== stockName);
    updateSelectedCryptos(updated);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(sheetUrl);      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      if (!text.includes('google.visualization.Query.setResponse')) {
        console.error("Invalid response format from Google Sheets");
        setLoading(false);
        return;
      }
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const now = new Date().getTime();
      if (!json.table || !json.table.rows) {
        console.error("No data found in sheet");
        setLoading(false);
        return;
      }
      let startIndex = 0;
      const firstRow = json.table.rows[0];
      if (firstRow && firstRow.c) {
        const firstRowPrice = firstRow.c[1]?.v;
        if (typeof firstRowPrice === 'string' && isNaN(parseFloat(firstRowPrice))) {
          startIndex = 1;
        }
      }
      const rows = json.table.rows
        .slice(startIndex)
        .map((row) => {
          if (!row.c) return null;
          const cells = row.c.map((cell) => cell?.v || null);          
          const name = cells[0];
          const currentPrice = parseFloat(cells[1]);
          const high52 = cells[2] ? parseFloat(cells[2]) : "N/A";
          const low52 = cells[3] ? parseFloat(cells[3]) : "N/A";
          const sector = cells[4] || "N/A";
          const priceHistoryString = cells[5];  
          if (!name || isNaN(currentPrice)) return null;
          const initialStock = INITIAL_STOCKS.find(stock => stock.name === name);
          const baselinePrice = initialStock ? initialStock.currentPrice : currentPrice;
          let priceHistory = [];
          let changePercent = "0.00";          
          if (priceHistoryString) {
            const stringValue = String(priceHistoryString);            
            if (stringValue.trim() !== '') {
              try {
                const priceArray = stringValue
                  .trim()
                  .split(',')
                  .map(p => parseFloat(p.trim()))
                  .filter(p => !isNaN(p) && p > 0);                
                if (priceArray.length > 0) {
                  priceHistory = priceArray.map((price, index) => ({
                    time: now - (priceArray.length - index - 1) * 60000,
                    price: price
                  }));                  
                  if (priceArray.length >= 2) {
                    const lastPrice = priceArray[priceArray.length - 1];
                    const secondLastPrice = priceArray[priceArray.length - 2];
                    changePercent = (((lastPrice - secondLastPrice) / secondLastPrice) * 100).toFixed(2);
                  }
                }
              } catch (error) {
                console.error(`Error parsing price history for ${name}:`, error);
              }
            }
          }
          return {
            name,
            price: currentPrice,
            baselinePrice,
            change: changePercent,
            high52,
            low52,
            sector,
            priceHistory,
            image: initialStock ? initialStock.image : null
          };
        })
        .filter(Boolean);
      setCryptoData(rows);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleMouseEnter = (crypto) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    const timer = setTimeout(() => {
      setHoveredCrypto(crypto);
    }, 1500);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setHoveredCrypto(null);
  };

  const newsHeadlines = RoundNews();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B091A]">
        <p className="text-white text-center text-xl">Loading PinBoard...</p>
      </div>
    );
  }

  if (cryptoData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B091A]">
        <p className="text-white text-center text-xl">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[30%] bg-[#0B091A] p-6">
      {newsHeadlines.length > 0 && (
        <div className="w-full bg-gradient-to-r from-[#0B091A] via-[#1A1730] to-[#0B091A] text-white overflow-hidden border-y border-[#7D67FF]/40 shadow-inner mb-6">
          <div className="flex items-center">
            <div className="bg-[#7D67FF] text-white font-semibold px-4 py-2 uppercase tracking-wide text-2xl">
              Breaking News
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="animate-marquee flex whitespace-nowrap text-sm font-medium text-gray-200">
                <div className="flex items-center text-xl">
                  {newsHeadlines.map((news, idx) => (
                    <span key={idx} className="flex items-center">
                      <span>{news}</span>
                      {idx !== newsHeadlines.length - 1 && <span className="text-[#7D67FF] text-3xl px-4">•</span>}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-xl">
                  {newsHeadlines.map((news, idx) => (
                    <span key={`dup-${idx}`} className="flex items-center">
                      <span>{news}</span>
                      {idx !== newsHeadlines.length - 1 && <span className="text-[#7D67FF] text-3xl px-4">•</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-4xl font-bold text-center mb-4 text-[#E1DFEC] DMSans">
        PinBoard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {cryptoData
          .filter((crypto) => selectedCryptos.includes(crypto.name))
          .map((crypto, index) => {
            // Calculate graph color (green if price >= base, red if less)
            let graphColor = "#22C55E"; // green-500
            if (crypto.priceHistory && crypto.priceHistory.length > 0) {
              const firstPrice = crypto.priceHistory[0].price;
              const lastPrice = crypto.priceHistory[crypto.priceHistory.length - 1].price;
              graphColor = lastPrice >= firstPrice ? "#22C55E" : "#EF4444";
            }
            return (
            <div
              key={index}
              className="relative flex items-center space-x-4 p-4 bg-[#0B091A] hover:bg-[#7D67FF] border border-gray-600 transition-colors duration-300 text-white rounded-lg shadow-md w-full group"
              onMouseEnter={() => handleMouseEnter(crypto)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => removeStock(crypto.name)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors z-30"
                title="Remove from PinBoard"
              >
                ×
              </button>

              <div className="flex flex-col space-y-2 w-1/2">
                <h3 className="text-lg font-bold">{crypto.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {crypto.image ? (
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={e => e.target.style.display="none"}
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-500 text-white text-md font-bold rounded-full flex items-center justify-center">
                        {crypto.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    ₹{crypto.price.toFixed(2)}
                  </div>
                </div>
                <div
                  className={`text-md font-bold ${
                    parseFloat(crypto.change) < 0 ? "text-red-500" : parseFloat(crypto.change) > 0 ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {parseFloat(crypto.change) < 0
                    ? `↓ ${crypto.change}%`
                    : parseFloat(crypto.change) > 0
                    ? `↑ ${crypto.change}%`
                    : `${crypto.change}%`}
                </div>
              </div>

              <div className="w-1/2 relative z-10 pointer-events-auto">
                {crypto.priceHistory && crypto.priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={crypto.priceHistory}>
                      <defs>
                        <linearGradient id={`lineGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={graphColor} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={graphColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto", "auto"]} hide />
                      <Tooltip
                        content={({ payload }) =>
                          payload?.length ? (
                            <div className="text-white bg-gray-800 px-2 py-1 rounded">
                              ₹{payload[0].value.toFixed(2)}
                            </div>
                          ) : null
                        }
                      />
                      <Area
                        type="linear"
                        dataKey="price"
                        stroke="none"
                        fill={`url(#lineGradient-${index})`}
                      />
                      <Line
                        type="linear"
                        dataKey="price"
                        stroke={graphColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-400">No history</div>
                )}
              </div>

              {hoveredCrypto?.name === crypto.name && (
                <div className="absolute right-[50%] top-0 bg-[#1E1B2E] border border-[#7D67FF]/40 rounded-xl p-4 shadow-2xl w-56 text-white z-20 animate-fadeIn backdrop-blur-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-[#E1DFEC] mb-2">
                    {crypto.name}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-400">Baseline:</span> ₹{crypto.baselinePrice.toFixed(2)}
                    </p>
                    <p>
                      <span className="text-gray-400">Current:</span> ₹{crypto.price.toFixed(2)}
                    </p>
                    <p>
                      <span className="text-gray-400">Change:</span>{" "}
                      <span className={`${parseFloat(crypto.change) < 0 ? "text-red-400" : parseFloat(crypto.change) > 0 ? "text-green-400" : "text-gray-400"}`}>
                        {parseFloat(crypto.change) < 0 ? `↓ ${crypto.change}%` : parseFloat(crypto.change) > 0 ? `↑ ${crypto.change}%` : `${crypto.change}%`}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">52 Week High:</span> ₹{typeof crypto.high52 === 'number' ? crypto.high52.toFixed(2) : crypto.high52}
                    </p>
                    <p>
                      <span className="text-gray-400">52 Week Low:</span> ₹{typeof crypto.low52 === 'number' ? crypto.low52.toFixed(2) : crypto.low52}
                    </p>
                    <p>
                      <span className="text-gray-400">Sector:</span> {crypto.sector}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )})}
      </div>
    </div>
  );
};

export default PinBoard;
