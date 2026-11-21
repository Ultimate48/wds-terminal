import React, { useState, useEffect, useContext, useMemo } from "react";
import { SelectedStocksContext } from "../Home";
import { Search, ArrowUp, ArrowDown, Pin, Check, RefreshCw } from "lucide-react";

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

const Stocks = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { selectedCryptos, updateSelectedCryptos } = useContext(SelectedStocksContext);

  const togglePin = (stockName) => {
    if (selectedCryptos.includes(stockName)) {
      updateSelectedCryptos(selectedCryptos.filter((s) => s !== stockName));
    } else {
      updateSelectedCryptos([...selectedCryptos, stockName]);
    }
  };

  const fetchStockData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const text = await res.text();
      if (!text.includes("google.visualization.Query.setResponse")) {
        throw new Error("Invalid sheet format");
      }

      const json = JSON.parse(text.substring(47).slice(0, -2));

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
          const latestPrice = parsePrice(cells[1]);
          const high52 = !isNaN(parsePrice(cells[2])) ? parsePrice(cells[2]) : "N/A";
          const low52 = !isNaN(parsePrice(cells[3])) ? parsePrice(cells[3]) : "N/A";
          const sector = cells[4] ? String(cells[4]).trim() : "General";
          const priceHistoryString = cells[5];

          if (!name || isNaN(latestPrice)) return null;

          // Upper and Lower Circuit (+10% / -10%)
          const upperCircuit = latestPrice * 1.10;
          const lowerCircuit = latestPrice * 0.90;

          let change = "0.00";
          let baselinePrice = latestPrice;

          if (priceHistoryString) {
            const str = String(priceHistoryString).trim();
            if (str) {
              try {
                const arr = str
                  .split(",")
                  .map((p) => parsePrice(p))
                  .filter((p) => !isNaN(p) && p > 0);

                if (arr.length > 0) baselinePrice = arr[0];

                if (arr.length >= 2) {
                  const last = arr[arr.length - 1];
                  const prev = arr[arr.length - 2];
                  if (prev > 0) {
                    change = (((last - prev) / prev) * 100).toFixed(2);
                  }
                }
              } catch (e) {
                console.error(`Error parsing history for ${name}:`, e);
              }
            }
          }

          return {
            name: String(name).trim(),
            price: latestPrice,
            baselinePrice,
            change,
            upperCircuit,
            lowerCircuit,
            high52,
            low52,
            sector,
          };
        })
        .filter(Boolean);

      setStockData(rows);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to sync sheet. Retrying...");
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 4000);
    return () => clearInterval(interval);
  }, []);

  const sectors = useMemo(() => {
    const set = new Set();
    stockData.forEach((s) => {
      if (s.sector && s.sector !== "N/A") set.add(s.sector);
    });
    return ["ALL", ...Array.from(set)];
  }, [stockData]);

  const filteredStocks = useMemo(() => {
    return stockData.filter((stock) => {
      const matchesSearch =
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === "ALL" || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [stockData, searchTerm, selectedSector]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-sm inline-block" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All Stocks & Circuit Limits
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time market prices with 10% Upper Circuit (UC) and Lower Circuit (LC) thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stock or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 focus:border-zinc-600 text-xs text-zinc-200 placeholder-zinc-500 rounded pl-9 pr-3 py-1.5 outline-none w-52 sm:w-64 transition-colors"
            />
          </div>

          <button
            onClick={fetchStockData}
            disabled={isRefreshing}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Sector filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide text-xs">
        {sectors.slice(0, 8).map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              selectedSector === sec
                ? "bg-red-700 text-white font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Classic Table */}
      <div className="border border-zinc-800 rounded-md bg-[#131316] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">Change</th>
                <th className="py-3 px-3 text-right text-emerald-400 bg-emerald-950/20">
                  Upper Circuit (+10%)
                </th>
                <th className="py-3 px-3 text-right text-rose-400 bg-rose-950/20">
                  Lower Circuit (-10%)
                </th>
                <th className="py-3 px-3 text-right hidden lg:table-cell text-zinc-400">52W High</th>
                <th className="py-3 px-3 text-right hidden lg:table-cell text-zinc-400">52W Low</th>
                <th className="py-3 px-4 hidden md:table-cell text-zinc-400">Sector</th>
                <th className="py-3 px-3 text-center">Pin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-zinc-500">
                    Loading stock records from sheet...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-zinc-500">
                    No stocks matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const isPinned = selectedCryptos.includes(stock.name);
                  const changeNum = parseFloat(stock.change);
                  const isPositive = changeNum > 0;
                  const isNegative = changeNum < 0;

                  return (
                    <tr
                      key={stock.name}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      {/* Name & Initials Badge */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0">
                            {getStockInitials(stock.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100">
                              {stock.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 md:hidden">
                              {stock.sector}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-2.5 px-3 text-right font-semibold text-white mono-num">
                        ₹{stock.price.toFixed(2)}
                      </td>

                      {/* Change */}
                      <td className="py-2.5 px-3 text-right mono-num">
                        <span
                          className={`inline-flex items-center gap-0.5 font-medium ${
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
                      </td>

                      {/* Upper Circuit */}
                      <td className="py-2.5 px-3 text-right mono-num font-semibold text-emerald-400 bg-emerald-950/10">
                        ₹{stock.upperCircuit.toFixed(2)}
                      </td>

                      {/* Lower Circuit */}
                      <td className="py-2.5 px-3 text-right mono-num font-semibold text-rose-400 bg-rose-950/10">
                        ₹{stock.lowerCircuit.toFixed(2)}
                      </td>

                      {/* 52W High */}
                      <td className="py-2.5 px-3 text-right hidden lg:table-cell mono-num text-zinc-400">
                        {typeof stock.high52 === "number" ? `₹${stock.high52.toFixed(2)}` : stock.high52}
                      </td>

                      {/* 52W Low */}
                      <td className="py-2.5 px-3 text-right hidden lg:table-cell mono-num text-zinc-400">
                        {typeof stock.low52 === "number" ? `₹${stock.low52.toFixed(2)}` : stock.low52}
                      </td>

                      {/* Sector */}
                      <td className="py-2.5 px-4 hidden md:table-cell text-zinc-400 text-xs">
                        {stock.sector}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => togglePin(stock.name)}
                          className={`p-1 rounded text-xs transition-colors ${
                            isPinned
                              ? "bg-red-700/20 text-red-400 hover:bg-red-700/30"
                              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                          }`}
                          title={isPinned ? "Remove from watchlist" : "Add to watchlist"}
                        >
                          {isPinned ? <Check className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="bg-zinc-900/60 border-t border-zinc-800 px-4 py-2.5 flex items-center justify-end text-xs text-zinc-500">
          <span>{filteredStocks.length} assets</span>
        </div>
      </div>
    </section>
  );
};

export default Stocks;
