// src/pdf/section.finder.js
import natural from 'natural';
const { WordTokenizer } = natural;

const tokenizer = new WordTokenizer();

function stem(word) {
  return word.toLowerCase()
    .replace(/[^a-zа-яё]/gi, '')
    .replace(/(ать|ить|ывать|овать|ение|ание|ия|ие|ы|а|о|е|у|я|и)$/i,'');
}

function tokenize(text = '') {
  return tokenizer.tokenize(text)
    .map(stem)
    .filter(w => w.length >= 3);
}

function scoreSection({ queryWords, titleWords, level }) {
  let score = 0;

  for (const qw of queryWords) {
    for (const tw of titleWords) {
      if (tw === qw) score += 10;           // точное совпадение корня
      else if (tw.includes(qw) || qw.includes(tw)) score += 6; // частичное совпадение
    }
  }

  // 🔹 Приоритет верхних уровней: меньше level → больше бонус
  score += 1 / level;

  return score;
}

export function findSection({ matches, tocFlat, query }) {
  if (!matches?.length) return null;

  const queryWords = tokenize(query);

  const scored = matches.map(section => {
    const titleWords = tokenize(section.title);
    const score = scoreSection({
      queryWords,
      titleWords,
      level: section.level
    });
    return { section, score };
  }).filter(s => s.score > 0);

  if (!scored.length) return null;

  // Сортировка по score, при равном score — верхний уровень выше
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.section.level - b.section.level; // меньший level выше
  });

  const best = scored[0].section;

  const currentIndex = tocFlat.findIndex(s => s.id === best.id);
  const next = tocFlat.slice(currentIndex + 1)
    .find(s => s.level <= best.level);

  return {
    section: best,
    fromPage: best.page,
    toPage: next ? next.page - 1 : best.page
  };
}
