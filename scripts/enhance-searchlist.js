const fs = require('fs');
const path = require('path');

// Read the searchlist
const searchlist = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/searchlist.json'), 'utf8'));

// Directory containing individual kanji files
const kanjiDir = path.join(__dirname, '../data/kanji');

console.log(`Processing ${searchlist.length} kanji...`);

let processed = 0;
let enhanced = 0;

// Process each kanji in the searchlist
const enhancedList = searchlist.map((item, index) => {
  processed++;
  if (processed % 500 === 0) {
    console.log(`Processed ${processed}/${searchlist.length}...`);
  }

  const kanjiChar = item.k;
  if (!kanjiChar) return item;

  try {
    // Try to read the individual kanji file
    const kanjiFilePath = path.join(kanjiDir, `${kanjiChar}.json`);

    if (fs.existsSync(kanjiFilePath)) {
      const kanjiData = JSON.parse(fs.readFileSync(kanjiFilePath, 'utf8'));

      const jlptLevel = kanjiData.jishoData?.jlptLevel || null;
      const strokeCount = kanjiData.jishoData?.strokeCount || kanjiData.kanjialiveData?.kanji?.strokes?.count || null;

      if (jlptLevel || strokeCount) {
        enhanced++;
      }

      return {
        ...item,
        j: jlptLevel,  // JLPT level (N5, N4, N3, N2, N1, or null)
        s: strokeCount // stroke count
      };
    }
  } catch (error) {
    // If file doesn't exist or can't be read, just return the original item
    console.error(`Error processing ${kanjiChar}:`, error.message);
  }

  return item;
});

console.log(`\nEnhanced ${enhanced} kanji with JLPT/stroke data`);
console.log(`Writing enhanced searchlist...`);

// Write the enhanced searchlist
fs.writeFileSync(
  path.join(__dirname, '../data/searchlist.json'),
  JSON.stringify(enhancedList),
  'utf8'
);

console.log(`Done! Enhanced searchlist written to data/searchlist.json`);
