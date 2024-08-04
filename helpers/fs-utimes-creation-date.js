const fs = require('fs');

const changeFsUtimes = (outputPath, creationDate) => {
  const timestamp = creationDate.getTime() / 1000; // Convert to UNIX timestamp
  fs.utimes(outputPath, timestamp, timestamp, (err) => {
    if (err) {
      console.error(`Error setting times for ${outputPath}:`, err);
    } else {
      console.log('yay');
    }
  });
};

module.exports = changeFsUtimes;
