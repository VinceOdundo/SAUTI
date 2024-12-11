const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  const clients = new Map();

  wss.on("connection", async (ws, req) => {
    try {
      const token = req.url.split("=")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      clients.set(decoded.userId, ws);

      ws.on("message", (message) => {
        const data = JSON.parse(message);
        handleWebSocketMessage(data, decoded.userId, clients);
      });

      ws.on("close", () => {
        clients.delete(decoded.userId);
      });
    } catch (error) {
      ws.close();
    }
  });

  return { wss, clients };
};

module.exports = { initializeWebSocket };
