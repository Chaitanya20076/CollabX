/*
 * movieUtils.js
 * Helper utilities for movie booking workflow.
 */

export const detectUnavailableMovies = (webResults) => {
  if (!Array.isArray(webResults) || webResults.length === 0) {
    return true;
  }
  const availabilityKeywords = [
    "showtimes",
    "now playing",
    "available",
    "tickets",
    "booking",
    "cinema",
    "theatre",
    "screen",
    "schedule",
  ];
  const normalize = (text) => (text || "").toString().toLowerCase();
  const hasAvailability = webResults.some((result) => {
    const content = normalize(result.content || result.snippet || result.title);
    return availabilityKeywords.some((kw) => content.includes(kw));
  });
  return !hasAvailability;
};

export const extractMovieOptions = (webResults) => {
  if (!Array.isArray(webResults) || webResults.length === 0) {
    return null;
  }
  
  const options = [];
  const timeRegex = /\b(1[0-2]|[1-9])(:[0-5][0-9])?\s*(am|pm)\b/gi;
  const theaterKeywords = ["cinemas", "pvr", "inox", "cinepolis", "theatre", "theater", "multiplex"];

  webResults.forEach(result => {
    const text = (result.title + " " + (result.content || result.snippet || "")).replace(/\n/g, " ");
    
    // Find times
    const timesMatch = text.match(timeRegex);
    let timeStr = timesMatch ? timesMatch[0] : "7:30 PM";

    // Find theater
    let theater = "Local Cinema";
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (theaterKeywords.some(tk => words[i].toLowerCase().includes(tk))) {
        // Grab context around the keyword
        const start = Math.max(0, i - 1);
        const end = Math.min(words.length, i + 2);
        theater = words.slice(start, end).join(" ");
        break;
      }
    }

    const opt = `${theater}, ${timeStr}, Standard Seats`;
    if (!options.includes(opt) && options.length < 3) {
      options.push(opt);
    }
  });

  return options.length > 0 ? options : null;
};
