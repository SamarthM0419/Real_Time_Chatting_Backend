const { io } = require("socket.io-client");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTg4MjY5MTlmMmEwZDUwY2FlZmFiYjAiLCJpYXQiOjE3NzE0OTIwMjksImV4cCI6MTc3MTU3ODQyOX0.sS936UigV5t4dDN8u0HDSYggVo4ChncAEFiGRSn-KSI";
const CHAT_ID = "6991483452671a57d9260c22";

const socket = io("http://localhost:5002", {
  transports: ["websocket"],   // 🔥 force websocket
  extraHeaders: {
    Cookie: `token=${TOKEN}`
  }
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Join chat
  socket.emit("joinChat", { chatId: CHAT_ID });

  // Send message after joining
  setTimeout(() => {
    socket.emit("sendMessage", {
      chatId: CHAT_ID,
      text: "Hello from backend test!"
    });
  }, 1000);
});

socket.on("receiveMessage", (msg) => {
  console.log("📩 Message received:", msg);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});
