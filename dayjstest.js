const dayjs = require('dayjs');

const a = dayjs();
const b = dayjs('2024-04-24');

// console.log({ a, b });

const c = dayjs(b);

const timestamp = new Date(b).getTime() / 1000;

console.log(timestamp);
