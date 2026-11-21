import { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { doc, getDoc } from "firebase/firestore";
import InfiniteScroller from "./InfiniteScroller";

const rtdbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://wds12-a506f-default-rtdb.asia-southeast1.firebasedatabase.app";

function RoundNews() {
  const [news, setNews] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);

  // Poll current round every 3 seconds so round changes update live
  useEffect(() => {
    const fetchCurrentRound = async () => {
      try {
        if (rtdbUrl) {
          const res = await fetch(`${rtdbUrl}/news_control/currentRound.json`);
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.round === "number") {
              setCurrentRound(data.round);
              return;
            }
          }
        }
        if (db) {
          const controlDocRef = doc(db, "news_control", "currentRound");
          const controlDocSnap = await getDoc(controlDocRef);
          if (controlDocSnap.exists()) {
            const r = controlDocSnap.data().round;
            setCurrentRound(typeof r === "number" ? r : 0);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching current round:", error);
      }
    };

    fetchCurrentRound();
    const interval = setInterval(fetchCurrentRound, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cumulative news (latest round at the top, previous rounds below)
  useEffect(() => {
    if (currentRound === null) return;

    // If Round 0, show initial round notice
    if (currentRound === 0) {
      setNews(["Initial round on the go"]);
      return;
    }

    const fetchCumulativeNews = async () => {
      try {
        const cumulativeNews = [];
        // Loop backwards from currentRound down to 1 so newer news is on top
        for (let r = currentRound; r >= 1; r--) {
          let roundNewsFound = false;
          if (rtdbUrl) {
            const res = await fetch(`${rtdbUrl}/news/round_${r}.json`);
            if (res.ok) {
              const data = await res.json();
              if (data && Array.isArray(data.news) && data.news.length > 0) {
                cumulativeNews.push(...data.news);
                roundNewsFound = true;
              }
            }
          }
          if (!roundNewsFound && db) {
            const roundDocRef = doc(db, "news", `round_${r}`); 
            const roundDocSnap = await getDoc(roundDocRef);
            if (roundDocSnap.exists() && roundDocSnap.data().news?.length > 0) {
              const list = roundDocSnap.data().news;
              cumulativeNews.push(...list);
              roundNewsFound = true;
            }
          }
          if (!roundNewsFound && r === 3) {
            cumulativeNews.push("IPO");
          }
        }
        setNews(cumulativeNews);
      } catch (error) {
        console.error("Error fetching cumulative news:", error);
      }
    };

    fetchCumulativeNews();
  }, [currentRound]);

  return <InfiniteScroller newsData={news} currentRound={currentRound} />;
}

export default RoundNews;
