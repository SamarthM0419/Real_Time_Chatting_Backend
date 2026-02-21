const { io } = require("socket.io-client");

const TOKEN_USER_1 = "TOKEN_USER_1";
const TOKEN_USER_2 = "TOKEN_USER_2";
const TOKEN_USER_3 = "TOKEN_USER_3";

const GROUP_CHAT_ID = "GROUP_CHAT_ID";

function createTestClient(userName, token) {
  const socket = io("http://localhost:5003", {
    transports: ["websocket"],
    extraHeaders: {
      Cookie: `token=${token}`
    }
  });

  socket.on("connect", () => {
    console.log(`[${userName}] Connected with socket ID: ${socket.id}`);
    console.log(`[${userName}] Joining group chat...`);
    
    socket.emit("joinChat", { chatId: GROUP_CHAT_ID });
  });

  socket.on("receiveMessage", (msg) => {
    console.log(`\n [${userName}] received a message: "${msg.text}"`);
  });

  socket.on("error", (err) => {
    console.log(`[${userName}] Backend Error:`, err);
  });

  socket.on("connect_error", (err) => {
    console.log(`[${userName}] Connection error:`, err.message);
  });

  return socket;
}

console.log("Starting Group Chat Test...\n");

const client1 = createTestClient("User 1", TOKEN_USER_1);
const client2 = createTestClient("User 2", TOKEN_USER_2);
const client3 = createTestClient("User 3", TOKEN_USER_3);

setTimeout(() => {
  console.log("\n--- User 1 is sending a message ---");
  client1.emit("sendMessage", {
    chatId: GROUP_CHAT_ID,
    text: "Hey everyone! Welcome to the group chat!"
  });
}, 2000);

setTimeout(() => {
  console.log("\n--- User 2 is replying ---");
  client2.emit("sendMessage", {
    chatId: GROUP_CHAT_ID,
    text: "Thanks! Happy to be here."
  });
}, 4000);

setTimeout(() => {
  console.log("\n--- User 3 is replying ---");
  client3.emit("sendMessage", {
    chatId: GROUP_CHAT_ID,
    text: "Hey guys! Is this working?"
  });
}, 6000);

setTimeout(() => {
    console.log("\n--- Test Complete, Disconnecting ---");
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    process.exit(0);
}, 10000);