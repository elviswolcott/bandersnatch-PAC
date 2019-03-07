const fs = require('fs');

console.log("Creating keys.json from environment variables.");

console.log("Environment variable test");
console.log(JSON.stringify(process.env));

fs.writeFileSync('./keys.json', JSON.stringify(process.env));