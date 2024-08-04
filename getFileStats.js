const fs = require('fs').promises;

const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    console.log(stats);
  } catch (err) {
    console.error(err);
  }
};

const filePath = process.argv.slice(2).join(' ');

// Check if file path is provided
if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}
getFileStats(filePath);
