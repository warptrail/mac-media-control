const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const a = dayjs();
const b = dayjs('2024-04-24');

// console.log({ a, b });

const c = dayjs(b);

const timestamp = new Date(b).getTime() / 1000;

const nineties = dayjs('1990-01-01T00:00:00Z').format();
const ninetiesUTC = dayjs.utc('1990-01-01T00:00:00Z').format();
console.log({ ninetiesBitch, ninetiesBitchUTC });
