
import { useState, useEffect } from "react";
import { 
  getFoodEntries, 
  clearOldEntries 
} from "@/utils/foodEntryManager";

export const useFoodEntries = () => {
  const [entries, setEntries] = useState(getFoodEntries());

  useEffect(() => {
    // Clear old entries at midnight
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        clearOldEntries();
        setEntries(getFoodEntries());
      }
    }, 60000);

    return () => {
      clearInterval(midnightCheck);
    };
  }, []);

  return { entries, setEntries };
};
