const net = require("net");
let port = 3000;
const client = net.createConnection(port, () => {
  console.log("--Connected--");
});

client.setEncoding("utf-8");
client.on("data", (data) => {
  console.log(data);
});

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  client.write(chunk);
});
