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
} from "recharts";
import { SelectedStocksContext } from "../Home";
import { ArrowUp, ArrowDown, X } from "lucide-react";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1yqcN9407uqN7gB202A-k0pVVqDr_uvKOEQvuU7RO9zQ/gviz/tq?tqx=out:json&headers=1";

const parsePrice = (val) => {
  if (val == null) return NaN;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
};

const getStockInitials = (name) => {
  if (!name) return "STK";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

function RoundNewsTicker() {
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
          setNews(["Initial round on the go"]);
          return;
        }

        if (currentRound === 3) {
          let foundNews = false;
          if (rtdbUrl) {
            const newsRes = await fetch(`${rtdbUrl}/news/round_3.json`);
            if (newsRes.ok) {
              const data = await newsRes.json();
              if (data && Array.isArray(data.news) && data.news.length > 0) {
                setNews(data.news);
                foundNews = true;
                return;
              }
            }
          }
          if (!foundNews && db) {
            const roundDocRef = doc(db, "news", "round_3");
            const roundDocSnap = await getDoc(roundDocRef);
            if (roundDocSnap.exists() && roundDocSnap.data().news?.length > 0) {
              setNews(roundDocSnap.data().news);
              foundNews = true;
              return;
            }
          }
          if (!foundNews) {
            setNews(["IPO"]);
            return;
          }
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
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  const removeStock = (stockName) => {
    const updated = selectedCryptos.filter((name) => name !== stockName);
    updateSelectedCryptos(updated);
  };

  const fetchSheetData = async () => {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const text = await res.text();
      if (!text.includes("google.visualization.Query.setResponse")) {
        setLoading(false);
        return;
      }

      const json = JSON.parse(text.substring(47).slice(0, -2));
      const now = Date.now();

      let startIndex = 0;
      const firstRow = json.table?.rows?.[0];
      if (firstRow && firstRow.c) {
        const firstRowPrice = parsePrice(firstRow.c[1]?.v);
        if (isNaN(firstRowPrice)) {
          startIndex = 1;
        }
      }

      const rows = (json.table?.rows || [])
        .slice(startIndex)
        .map((row) => {
          if (!row.c) return null;
          const cells = row.c.map((cell) => cell?.v ?? null);

          const name = cells[0];
          const currentPrice = parsePrice(cells[1]);
          const high52 = !isNaN(parsePrice(cells[2])) ? parsePrice(cells[2]) : "N/A";
          const low52 = !isNaN(parsePrice(cells[3])) ? parsePrice(cells[3]) : "N/A";
          const sector = cells[4] ? String(cells[4]).trim() : "General";
          const priceHistoryString = cells[5];

          if (!name || isNaN(currentPrice)) return null;

          const upperCircuit = currentPrice * 1.10;
          const lowerCircuit = currentPrice * 0.90;

          let baselinePrice = currentPrice;
          let priceHistory = [];
          let changePercent = "0.00";

          if (priceHistoryString) {
            const str = String(priceHistoryString).trim();
            if (str) {
              try {
                const arr = str
                  .split(",")
                  .map((p) => parsePrice(p))
                  .filter((p) => !isNaN(p) && p > 0);

                if (arr.length > 0) {
                  baselinePrice = arr[0];
                  priceHistory = arr.map((p, idx) => ({
                    time: now - (arr.length - idx - 1) * 60000,
                    price: p,
                  }));

                  if (arr.length >= 2) {
                    const last = arr[arr.length - 1];
                    const prev = arr[arr.length - 2];
                    if (prev > 0) {
                      changePercent = (((last - prev) / prev) * 100).toFixed(2);
                    }
                  }
                }
              } catch (e) {
                console.error(`Error parsing history for ${name}:`, e);
              }
            }
          }

          if (priceHistory.length === 0) {
            priceHistory = [
              { time: now - 60000, price: currentPrice },
              { time: now, price: currentPrice },
            ];
          }

          return {
            name: String(name).trim(),
            price: currentPrice,
            baselinePrice,
            upperCircuit,
            lowerCircuit,
            change: changePercent,
            high52,
            low52,
            sector,
            priceHistory,
          };
        })
        .filter(Boolean);

      setStockData(rows);

      // Auto-populate 6 stocks if empty
      if (rows.length > 0) {
        const saved = localStorage.getItem("selectedCryptos");
        const list = saved ? JSON.parse(saved) : [];
        if (!list || list.length === 0) {
          updateSelectedCryptos(rows.slice(0, 6).map((r) => r.name));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("PinBoard fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
    const interval = setInterval(fetchSheetData, 4000);
    return () => clearInterval(interval);
  }, []);

  const newsHeadlines = RoundNewsTicker();
  const pinnedStocks = stockData.filter((s) => selectedCryptos.includes(s.name));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6">
      {/* News Ticker */}
      {newsHeadlines.length > 0 && (
        <div className="mb-6 rounded bg-zinc-900 border border-zinc-800 flex items-center overflow-hidden">
          <div className="bg-red-700 text-white font-bold text-xs uppercase px-3 py-2 shrink-0 tracking-wider">
            News
          </div>
          <div className="relative flex-1 overflow-hidden py-1.5 px-3">
            <div className="animate-marquee flex whitespace-nowrap text-xs text-zinc-300 font-medium">
              <div className="flex items-center gap-8 pr-8">
                {newsHeadlines.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="text-red-500">&bull;</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-8 pr-8">
                {newsHeadlines.map((item, idx) => (
                  <span key={`dup-${idx}`} className="flex items-center gap-2">
                    <span className="text-red-500">&bull;</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Section Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-sm inline-block" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Pinned Watchlist
          </h2>
        </div>
        <span className="text-xs text-zinc-500">
          {pinnedStocks.length} pinned
        </span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-sm">
          Loading pinned stocks...
        </div>
      ) : pinnedStocks.length === 0 ? (
        <div className="py-8 text-center bg-[#131316] border border-zinc-800 rounded text-xs text-zinc-500">
          No stocks currently pinned. Pin any stock from the table below.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinnedStocks.map((stock) => {
            const changeNum = parseFloat(stock.change);
            const isPositive = changeNum > 0;
            const isNegative = changeNum < 0;
            const strokeColor = isNegative ? "#EF4444" : "#10B981";

            return (
              <div
                key={stock.name}
                className="relative bg-[#131316] border border-zinc-800 hover:border-zinc-700 transition-colors rounded p-4 flex flex-col justify-between"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeStock(stock.name)}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                  title="Unpin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Stock Info */}
                <div>
                  <div className="flex items-center gap-2.5 mb-2 pr-6">
                    <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[11px] text-zinc-300 shrink-0">
                      {getStockInitials(stock.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm line-clamp-1">
                        {stock.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500">{stock.sector}</p>
                    </div>
                  </div>

                  {/* Price & Change */}
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xl font-bold text-white mono-num">
                      ₹{stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold mono-num ${
                        isPositive
                          ? "text-emerald-400"
                          : isNegative
                          ? "text-red-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {isPositive && <ArrowUp className="w-3 h-3" />}
                      {isNegative && <ArrowDown className="w-3 h-3" />}
                      {isPositive ? `+${stock.change}` : stock.change}%
                    </span>
                  </div>

                  {/* Circuit Limits Box */}
                  <div className="grid grid-cols-2 gap-2 p-2 rounded bg-zinc-900 border border-zinc-800/80 mb-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                        Upper Circuit (+10%)
                      </span>
                      <span className="font-bold text-emerald-400 mono-num">
                        ₹{stock.upperCircuit.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-l border-zinc-800 pl-2">
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                        Lower Circuit (-10%)
                      </span>
                      <span className="font-bold text-rose-400 mono-num">
                        ₹{stock.lowerCircuit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="w-full h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stock.priceHistory}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto", "auto"]} hide />
                      <Tooltip
                        content={({ payload }) =>
                          payload?.length ? (
                            <div className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-[11px] text-zinc-200 mono-num">
                              ₹{Number(payload[0].value).toFixed(2)}
                            </div>
                          ) : null
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={1.8}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PinBoard;
