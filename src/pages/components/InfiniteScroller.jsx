import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExternalLink } from "lucide-react";

const InfiniteScroller = ({ newsData = [], currentRound = null }) => {
  const staticNews = [
    "Initial round on the go",
  ];
  const initialNews = newsData.length > 0 ? newsData.slice(0, 6) : staticNews;

  const [news, setNews] = useState(initialNews);
  const loaderRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (newsData.length > 0) {
      setNews(newsData.slice(0, 6));
      setHasMore(newsData.length > 6);
    } else {
      setNews(staticNews);
      setHasMore(false);
    }
  }, [newsData]);

  const loadMoreNews = useCallback(() => {
    if (!Array.isArray(newsData)) return;

    setTimeout(() => {
      setNews((prevNews) => {
        const nextItems = newsData.slice(prevNews.length, prevNews.length + 3);
        if (nextItems.length === 0) {
          setHasMore(false);
          return prevNews;
        }
        return [...prevNews, ...nextItems];
      });
    }, 600);
  }, [newsData]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreNews();
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loadMoreNews, hasMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-sm inline-block" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Round Activity & Announcements
          </h2>
        </div>
        <span className="text-xs font-medium text-zinc-400">
          {currentRound === 0 ? "Initial round on the go" : currentRound === 3 ? "IPO" : currentRound ? `Round ${currentRound}` : "Live feed"}
        </span>
      </div>

      {/* Feed Container */}
      <div className="w-full max-h-[260px] h-[220px] p-3 border border-zinc-800 rounded bg-[#131316] flex flex-col">
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {news.length > 0 ? (
            news.map((item, index) => {
              const isLink =
                typeof item === "string" && item.trim().startsWith("http");

              return (
                <div
                  key={index}
                  className="p-3 bg-zinc-900 border border-zinc-800/80 rounded text-xs sm:text-sm text-zinc-200 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    {isLink ? (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Budget Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>{item}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-zinc-500 py-8 text-xs">
              No news announcements yet.
            </p>
          )}

          {hasMore && (
            <div ref={loaderRef} className="text-center text-zinc-500 text-xs py-2 font-medium">
              Loading older updates...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfiniteScroller;
