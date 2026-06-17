const fs = require('fs');
const source = fs.readFileSync('src/data/gameData.js', 'utf-8');

let cleaned = source.replace(/^export /gm, '');

for (let i = 0; i < cleaned.length; i += 50000) {
  const chunk = cleaned.slice(0, i + 50000);
  try {
    new Function(chunk);
  } catch (e) {
    console.log('Error in chunk ending at byte', i + 50000);
    console.log('Error message:', e.message);
    const lines = chunk.split('\n');
    console.log('Last 10 lines:');
    for (let j = Math.max(0, lines.length - 10); j < lines.length; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}
