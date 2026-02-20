const { io } = require("socket.io-client");

const token = "YOUR_TOKEN";

const socket = io("http://localhost:5003", {
  transports: ["websocket"],
  extraHeaders: {
    Cookie: `token=${token}`
  }
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  console.log("Joining chat...");
  socket.emit("joinChat", {
    chatId: "6998108c6fff6427766064f8"
  });

  setTimeout(() => {
    console.log("Sending message...");
    socket.emit("sendMessage", {
      chatId: "6998108c6fff6427766064f8",
      text: "Hello from test client"
    });
  }, 2000);
});

socket.on("receiveMessage", (msg) => {
  console.log("Message received:", msg);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});