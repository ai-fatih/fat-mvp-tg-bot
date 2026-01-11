// src/pdf/search.service.js

function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function scoreMatch(queryWords, titleWords) {
    let score = 0;
  
    for (const q of queryWords) {
      if (titleWords.includes(q)) {
        score += 2;
      } else {
        const partial = titleWords.find(
          w => w.startsWith(q) || q.startsWith(w)
        );
        if (partial) score += 1;
      }
    }
  
    return score;
  }
  
  export function searchSections({ query, tocFlat, limit = 5 }) {
    if (!query || !tocFlat?.length) return [];
  
    const queryWords = normalize(query).split(' ');
  
    const results = tocFlat
      .map(item => {
        const titleWords = normalize(item.title).split(' ');
        const score = scoreMatch(queryWords, titleWords);
  
        return score > 0
          ? { ...item, score }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.level !== a.level) return a.level - b.level;
        return b.id.length - a.id.length;
      })
      .slice(0, limit)
      .map(({ score, ...item }) => item); // score наружу не отдаём
  
    return results;
  }
  