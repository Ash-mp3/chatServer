const fs = require("fs");
const net = require("net");
let id = 1;
let port = 3000;
let users = [];
const password = 'password';

const writeStream = fs.createWriteStream("./server.log");

const server = net.createServer((client) => {
  const createIDs = () => {
    client.username = `user${id}`;
    users.push({ username: `user${id}`, client: client });
    client.write(`welcome to the chat server ${client.username}`);
    console.log(`${client.username} joined`);
    writeStream.write(`${client.username} joined\n`);
    id++;
  };

  const postToOthers = (msg) => {
    users.forEach((user) => {
      if (user.username !== client.username) {
        user.client.write(`${client.username}: ${msg}`);
      }
    });
  };

  createIDs();
  postToOthers("joined");

  const handleCommands = class {
    constructor(userInput) {
      this.userInput = userInput;
      this.w = this.Wisper;
      this.username = this.ChangeName;
      this.kick = this.kickUser;
      this.clientList = this.ShowConnected;
    }

    Wisper(userInput) {
      const dmUser = userInput.split(" ")[1];
      let wisperUser = users.find((user) => user.username === dmUser);
      if (userInput.split(" ").length === 2) {
        client.write(`did you mean to wisper somthing? try again`);
      } else if (wisperUser && wisperUser.username === client.username) {
        client.write(`you can't wisper to yourself silly`);
      } else if (wisperUser && wisperUser.username !== client.username) {
        wisperUser.client.write(
          `${client.username} wispered: ${userInput
            .split(" ")
            .slice(2)
            .join(" ")}`
        );
      } else {
        client.write(`sorry, there is no user with that name`);
      }
    }

    ChangeName(userInput) {
      const newName = userInput.split(" ")[1];
      const currUser = users.find((user) => user.username === client.username);
      // const checkNameAvailability = users.find((user) => user.username === newName);
      const changeNameMsg = `${client.username} has changed there name to ${newName}`;
      if (userInput.split(" ").length === 1) {
        client.write("there was no name entered, please try again");
      } else if (currUser === newName) {
        client.write("your new username cant be your old username");
      } else if (users.find((user) => user.username === newName)) {
        client.write("that name is unavailability, please try again");
      } else {
        console.log(changeNameMsg);
        writeStream.write(changeNameMsg);
        postToOthers(`has changed there name to ${newName}`);
        client.write(`You have scucccesfuly changed your name to ${newName}`);
        currUser.username = newName;
        client.username = newName;
      }
    }

    kickUser(userInput) {
      const inputUser = userInput.split(" ")[1];
      const inputPassword = userInput.split(" ")[2];
      const kickedMsg = `${inputUser} was kicked by ${client.username}\n`;
      console.log(!!users.find((user) => user.username === inputUser));
      if (userInput.split(" ").length === 1) {
        client.write(`witch user would you like to kick, please try again`);
      } else if (!users.find((user) => user.username === inputUser)) {
        client.write(
          "we could not find a user with that name, please try again"
        );
      } else if (userInput.split(" ").length === 2) {
        client.write("please enter the password after the users name");
      } else if (inputPassword !== password) {
        client.write("password incorrect");
      } else {
        users.forEach((user, index) => {
          if (user.username === inputUser) {
            user.client.write("you have been kicked from the server");
            user.client.end();
            users.splice(index, 1);
          }
        });
        writeStream.write(kickedMsg);
        console.log(kickedMsg);
      }
    }
    ShowConnected() {
      users.forEach((user) => {
        client.write(`--${user.username}--`);
        writeStream.write(`--${user.username}--\n`);
      });
    }
  };
  client.on("data", (chunk) => {
    const message = chunk.toString().trim();
    const command = message.split(' ')[0]
    const commandClass = new handleCommands();

    if (command === `/w`) {
      commandClass.w(message);
    } else if (command === `/username`) {
      commandClass.username(message);
    } else if (command === `/kick`) {
      commandClass.kick(message);
    } else if (command === `/clientlist`) {
      commandClass.clientList();
    } else if (message.startsWith(`/`)) {
      client.write(`invalid command, please try again`);
    } else {
      console.log(`${client.username}: ${message}`);
      writeStream.write(`${client.username}: ${message}\n`);
      postToOthers(message);
    }
  });

  client.on("close", () => {
    const disconnectedMsg = `${client.username} has disconnected`;
    writeStream.write(`${disconnectedMsg}\n`);
    console.log(disconnectedMsg);
    postToOthers("has disconnected");
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
