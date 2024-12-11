const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket.id);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("notification", notification);
    }
  }

  // Send notification to multiple users
  broadcastNotification(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }

  // Send system-wide notification
  broadcastSystemNotification(notification) {
    this.io.emit("system_notification", notification);
  }
}

module.exports = new SocketService();
