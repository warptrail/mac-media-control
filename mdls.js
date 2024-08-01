const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = promisify(exec);

// Get all metadata from file
const getMetadata = async (filePath) => {
  try {
    const { stdout } = await execPromise(`mdls ${filePath}`);
    const metadata = parseMdlsOutput(stdout);
    console.log(stdout);
    return metadata;
  } catch (err) {
    console.error(`Error retrieving metadata ${err.message}`);
    throw err;
  }
};

// Format the mdls output to JSON
const parseMdlsOutput = (output) => {
  const metadata = {};
  const lines = output.split('\n');

  lines.forEach((line) => {
    const [key, value] = line.split(' = ');
    if (key && value) {
      metadata[key.trim()] = parseValue(value.trim());
    }
  });

  return metadata;
};

const parseValue = (value) => {
  // Attempt to parse as JSON, otherwise return the string value
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Write all metadata to file
const writeMetadataToJson = async (filePath) => {
  try {
    const metadata = await getMetadata(filePath);
    const fileDir = path.dirname(filePath);
    const fileName =
      path.basename(filePath, path.extname(filePath)) + '_mdls_metadata.json';
    const outputPath = path.join(fileDir, fileName);

    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata written to ${outputPath}`);
  } catch (err) {
    console.error(`Error writing metadata to JSON: ${err.message}`);
  }
};

const filePath = process.argv.slice(2).join(' ');

// Check if file path is provided
if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

writeMetadataToJson(filePath);
