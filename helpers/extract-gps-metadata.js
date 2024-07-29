const extractGPSMetadata = (metadata) => {
  const gpsData = {
    GPSLatitude: metadata.GPSLatitude,
    GPSLongitude: metadata.GPSLongitude,
    GPSAltitude: metadata.GPSAltitude,
    GPSLatitudeRef: metadata.GPSLatitudeRef,
    GPSLongitudeRef: metadata.GPSLongitudeRef,
    GPSAltitudeRef: metadata.GPSAltitudeRef,
    LocationAccuracyHorizontal: metadata.LocationAccuracyHorizontal,
  };

  return gpsData;
};

module.exports = extractGPSMetadata;
