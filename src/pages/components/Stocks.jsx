import React, { useState, useEffect, useContext } from "react";
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
  { name: "Abbott India", currentPrice: 29930, image:  abbotImg },
  { name: "RRP Semiconductor", currentPrice: 10673.65, image: rrpImg },
  { name: "Dixon Technologies", currentPrice: 15617, image: dixonImg },
  { name: "Cian Agro", currentPrice: 2071.95, image: cianImg },
  { name: "Tata motors passenger vehicles", currentPrice: 679.4, image: tatamotorsImg },
  { name: "Jio Saavn", currentPrice: 155, image: jioSaavnImg },
];

const sheetUrl = "https://docs.google.com/spreadsheets/d/1yqcN9407uqN7gB202A-k0pVVqDr_uvKOEQvuU7RO9zQ/gviz/tq?tqx=out:json&headers=1";

const CryptoTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Math.floor(Date.now() / 1000));
  
  const { selectedCryptos, updateSelectedCryptos } = useContext(SelectedStocksContext);

  const addToPinBoard = (stockName) => {
    if (!selectedCryptos.includes(stockName)) {
      const updated = [...selectedCryptos, stockName];
      updateSelectedCryptos(updated);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = Math.floor(Date.now() / 1000); 
        setLastUpdateTime(now);

        const res = await fetch(sheetUrl);
        const text = await res.text();
        
        if (!text.includes('google.visualization.Query.setResponse')) {
          throw new Error("Invalid sheet response");
        }
        
        const json = JSON.parse(text.substring(47).slice(0, -2));

        let startIndex = 0;
        const firstRow = json.table.rows[0];
        if (firstRow && firstRow.c) {
          const firstRowPrice = firstRow.c[1]?.v;
          if (typeof firstRowPrice === 'string' && isNaN(parseFloat(firstRowPrice))) {
            startIndex = 1;
          }
        }

        const rows = json.table.rows.slice(startIndex).map((row) => {
          if (!row.c) return null;
          
          const cells = row.c.map((cell) => cell?.v || null);

          const name = cells[0];
          const latestPrice = parseFloat(cells[1]);
          const high52 = cells[2] ? parseFloat(cells[2]) : "N/A";
          const low52 = cells[3] ? parseFloat(cells[3]) : "N/A";
          const sector = cells[4] || "N/A";
          const priceHistoryString = cells[5];

          if (!name || isNaN(latestPrice)) return null;

          const initialStock = INITIAL_STOCKS.find(stock => stock.name === name);
          const startPrice = initialStock ? initialStock.currentPrice : latestPrice;

          let change = "0.00";

          if (priceHistoryString) {
            const stringValue = String(priceHistoryString);
            
            if (stringValue.trim() !== '') {
              try {
                const priceArray = stringValue
                  .trim()
                  .split(',')
                  .map(p => parseFloat(p.trim()))
                  .filter(p => !isNaN(p) && p > 0);

                if (priceArray.length >= 2) {
                  const lastPrice = priceArray[priceArray.length - 1];
                  const secondLastPrice = priceArray[priceArray.length - 2];
                  change = (((lastPrice - secondLastPrice) / secondLastPrice) * 100).toFixed(2);
                }
              } catch (error) {
                console.error(`Error parsing price history for ${name}:`, error);
              }
            }
          }

          const timeSinceUpdate = now - lastUpdateTime;

          return { 
            name, 
            price: latestPrice, 
            startPrice, 
            change, 
            updated: timeSinceUpdate,
            high52,
            low52,
            sector,
            image: initialStock ? initialStock.image : null
          };
        }).filter(Boolean);

        setCryptoData(rows);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Retrying...");
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h2 className="text-4xl font-bold text-center mb-[1%] text-[#E1DFEC] DMSans">Stocks</h2>
      <div className="flex justify-center items-center min-h-screen">
        <table
          className="mx-auto text-white rounded-lg shadow-lg text-center border-separate border-spacing-4"
          style={{ backgroundColor: "rgb(16,14,33)" }}
        >
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm md:text-lg">
              <th className="p-[0.5%] DMSans">Stocks</th>
              <th className="p-[0.5%] DMSans hidden sm:table-cell">Updated</th>
              <th className="p-[0.5%] DMSans">Change</th>
              <th className="p-[0.5%] DMSans">Price</th>
              <th className="p-[0.5%] DMSans hidden md:table-cell">52W High</th>
              <th className="p-[0.5%] DMSans hidden md:table-cell">52W Low</th>
              <th className="p-[0.5%] DMSans hidden md:table-cell">Sector</th>
              <th className="p-[0.5%] DMSans">Monitor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-4 text-gray-400 text-center">Loading data...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="p-4 text-red-500 text-center">{error}</td>
              </tr>
            ) : (
              cryptoData.map((crypto, index) => (
                <tr key={index} className="border-b border-gray-700 text-sm md:text-lg">
                  <td className="p-[4%] flex items-center text-left">
                    <div className="w-[6vw] h-[6vw] md:w-[2vw] md:h-[2vw] flex items-center justify-center mr-[2%]">
                      {crypto.image ? (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-500 text-white text-sm md:text-lg font-bold rounded-full flex items-center justify-center">
                          {crypto.name[0]}
                       </div>
                     )}
                    </div>
                    {crypto.name}
                  </td>
                  <td className="p-[1%] text-gray-400 hidden sm:table-cell">{crypto.updated} secs ago</td>
                  <td className={`p-[1%] ${crypto.change < 0 ? "text-red-500" : parseFloat(crypto.change) > 0 ? "text-green-500" : "text-gray-400"}`}>
                    {crypto.change < 0 ? "↓" : parseFloat(crypto.change) > 0 ? "↑" : ""} {crypto.change}%
                  </td>
                  <td className="p-[1%]">₹{crypto.price}</td>
                  <td className="p-[1%] text-gray-300 hidden md:table-cell">
                    {typeof crypto.high52 === 'number' ? `₹${crypto.high52.toFixed(2)}` : crypto.high52}
                  </td>
                  <td className="p-[1%] text-gray-300 hidden md:table-cell">
                    {typeof crypto.low52 === 'number' ? `₹${crypto.low52.toFixed(2)}` : crypto.low52}
                  </td>
                  <td className="p-[1%] text-gray-400 hidden md:table-cell">{crypto.sector}</td>
                  <td className="p-[1%]">
                    <button
                      onClick={() => addToPinBoard(crypto.name)}
                      disabled={selectedCryptos.includes(crypto.name)}
                      className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                        selectedCryptos.includes(crypto.name)
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-[#7D67FF] hover:bg-[#6B57E8] text-white'
                      }`}
                      title={selectedCryptos.includes(crypto.name) ? "Already in PinBoard" : "Add to PinBoard"}
                    >
                      {selectedCryptos.includes(crypto.name) ? "✓" : "+"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CryptoTable;
