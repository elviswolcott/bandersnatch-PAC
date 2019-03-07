const fs = require('fs');

console.log("Creating keys.json from environment variables.");

console.log("Environment variable test");

fs.writeFileSync('./keys.json', JSON.stringify(process.env));

console.log("Checking file contents");
const output = require('./keys.json');
console.log(output.publishKey, output.subscribeKey);