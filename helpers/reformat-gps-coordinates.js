const reformatGPSCoordinates = (gpsData) => {
  // Regular expression to extract latitude, longitude, and altitude components
  const regex =
    /(\d+) deg (\d+)' ([\d.]+)" (N|S), (\d+) deg (\d+)' ([\d.]+)" (E|W), (\d+\.\d+) m Above Sea Level/;

  const coords = gpsData.GPSCoordinates;

  const match = !!coords ? coords.match(regex) : null;

  if (match) {
    // Parse latitude components
    const latDeg = parseInt(match[1]);
    const latMin = parseInt(match[2]);
    const latSec = parseFloat(match[3]);
    const latDir = match[4];

    // Parse longitude components
    const lonDeg = parseInt(match[5]);
    const lonMin = parseInt(match[6]);
    const lonSec = parseFloat(match[7]);
    const lonDir = match[8];

    // Parse altitude
    const altitude = parseFloat(match[9]);

    // Convert latitude and longitude to decimal degrees
    const latitude =
      (latDir === 'N' ? 1 : -1) * (latDeg + latMin / 60 + latSec / 3600);
    const longitude =
      (lonDir === 'E' ? 1 : -1) * (lonDeg + lonMin / 60 + lonSec / 3600);

    // Format latitude, longitude, and altitude to ISO6709 string
    const formattedGPSPosition = `+${latitude.toFixed(6)}${longitude.toFixed(
      6
    )}+${altitude.toFixed(3)}/`;

    return { latitude, longitude, altitude, formattedGPSPosition };
  } else {
    return null;
  }
};

// Example usage
/*
const gpsPosition =
  '35 deg 13\' 36.48" N, 119 deg 15\' 41.76" W, 93.708 m Above Sea Level';
const iso6709String = reformatGPSCoordinates(gpsPosition);
console.log(iso6709String); // Output: +35.2268-119.2616+093.708/
*/

module.exports = reformatGPSCoordinates;
