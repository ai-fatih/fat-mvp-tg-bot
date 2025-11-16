const fs = require('fs');
const Fuse = require('fuse.js');

const KB_PATH = './kb/kb.json';

function loadKB() {
  const raw = fs.readFileSync(KB_PATH, 'utf8');
  return JSON.parse(raw);
}

function createFuse(kb) {
  const options = {
    keys: ['title', 'tags', 'short_answer', 'examples'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3
  };
  return new Fuse(kb, options);
}

function search(query) {
  const kb = loadKB();
  const fuse = createFuse(kb);
  return fuse.search(query).slice(0, 3).map(r => ({
    score: r.score,
    item: r.item
  }));
}

module.exports = { search };