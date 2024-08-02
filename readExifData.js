const exiftool = require('node-exiftool');
const fs = require('fs');
const path = require('path');

const ep = new exiftool.ExiftoolProcess();

const getMetaData = async (filePath) => {
  try {
    await ep.open();

    const metadata = await ep.readMetadata(filePath, ['-File:all']);
    const metadataJson = metadata.data[0];

    // Create the JSON file path
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const jsonFilePath = path.join(fileDir, `${fileName}_metadata.json`);

    // Write metadata to JSON file
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(metadataJson, null, 2),
      'utf8'
    );

    console.log(`Metadata written to ${jsonFilePath}`);
    console.log(metadataJson);
  } catch (err) {
    console.error(`failed to read metadata from ${filePath}`, err);
  } finally {
    await ep.close();
  }
};

// Get the file path from the command-line arguments
const filePath = process.argv.slice(2).join(' ');

// Check if file path is provided
if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

// Run the function to read metadata and write to JSON
getMetaData(filePath);
