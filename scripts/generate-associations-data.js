const fs = require('fs');
const path = require('path');

console.log('Generating static associations graph data...\n');

// Read composition data
const composition = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/composition.json'), 'utf8')
);

const allKanji = Object.keys(composition);
console.log(`Found ${allKanji.length} kanji in composition data`);

// Build all links from the composition data
const links = [];
let linkCount = 0;

console.log('Building links...');
allKanji.forEach((kanji, index) => {
  if (index % 500 === 0) {
    console.log(`Processing kanji ${index}/${allKanji.length}...`);
  }

  const compositionData = composition[kanji];

  // Add incoming links (components that make up this kanji)
  compositionData.in.forEach((component) => {
    if (component !== kanji && allKanji.includes(component)) {
      links.push({ source: component, target: kanji });
      linkCount++;
    }
  });

  // Add outgoing links (kanji that this is a component of)
  compositionData.out.forEach((parent) => {
    if (parent !== kanji && allKanji.includes(parent)) {
      links.push({ source: kanji, target: parent });
      linkCount++;
    }
  });
});

console.log(`Created ${linkCount} links`);

// Remove duplicate links
const uniqueLinks = links.filter(
  (value, index, self) =>
    index ===
    self.findIndex(
      (t) => t.source === value.source && t.target === value.target
    )
);

console.log(`After deduplication: ${uniqueLinks.length} unique links\n`);

// Load kanji data for all nodes
console.log('Loading kanji data for nodes...');
const kanjiDir = path.join(__dirname, '../data/kanji');
const nodes = [];
let processedCount = 0;
let successCount = 0;

allKanji.forEach((kanji, index) => {
  processedCount++;
  if (processedCount % 500 === 0) {
    console.log(`Loading kanji data ${processedCount}/${allKanji.length}...`);
  }

  try {
    const kanjiFilePath = path.join(kanjiDir, `${kanji}.json`);

    if (fs.existsSync(kanjiFilePath)) {
      const kanjiData = JSON.parse(fs.readFileSync(kanjiFilePath, 'utf8'));

      nodes.push({
        id: kanji,
        data: kanjiData,
      });
      successCount++;
    } else {
      // File doesn't exist, skip this kanji
      console.warn(`Warning: File not found for kanji: ${kanji}`);
    }
  } catch (error) {
    console.error(`Error loading data for kanji ${kanji}:`, error.message);
  }
});

console.log(`\nSuccessfully loaded data for ${successCount} kanji`);

// Create the final graph data structure
const graphData = {
  nodes: nodes,
  links: uniqueLinks,
};

// Write to public directory so it can be served as a static asset
const outputPath = path.join(__dirname, '../public/data/associations-graph.json');
const outputDir = path.dirname(outputPath);

// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`\nWriting graph data to ${outputPath}...`);
fs.writeFileSync(outputPath, JSON.stringify(graphData), 'utf8');

// Also write a compressed version with minimal whitespace for production
const compressedPath = path.join(__dirname, '../public/data/associations-graph.min.json');
fs.writeFileSync(compressedPath, JSON.stringify(graphData), 'utf8');

const stats = fs.statSync(outputPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`\n✓ Success!`);
console.log(`  Generated file: ${outputPath}`);
console.log(`  File size: ${fileSizeMB} MB`);
console.log(`  Nodes: ${nodes.length}`);
console.log(`  Links: ${uniqueLinks.length}`);
