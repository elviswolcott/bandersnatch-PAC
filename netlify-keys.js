const fs = require('fs');

console.log("Creating keys.json from environment variables.");

fs.writeFileSync('./keys.json', JSON.stringify(process.env));