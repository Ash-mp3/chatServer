const net = require("net");
let port = 3000;

// sends client a connected message
const client = net.createConnection(port, () => {
  console.log("--Connected--");
});

client.setEncoding("utf-8");

// listens for user input 
client.on("data", (data) => {
  console.log(data);
});

process.stdin.setEncoding("utf8");

//listens for server data
process.stdin.on("data", (chunk) => {
  client.write(chunk);
});
