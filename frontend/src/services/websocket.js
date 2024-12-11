import { store } from "../store";
import {
  setWebSocketConnected,
  addNotification,
  updateUnreadCount,
} from "../store/slices/notificationSlice";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // Start with 1 second
  }

  connect() {
    const token = store.getState().auth.token;
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:5000/ws";
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  handleOpen() {
    console.log("WebSocket connected");
    store.dispatch(setWebSocketConnected(true));
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 1000;
  }

  handleClose(event) {
    console.log("WebSocket disconnected:", event);
    store.dispatch(setWebSocketConnected(false));

    // Attempt to reconnect if not a clean close
    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2; // Exponential backoff
        this.connect();
      }, this.reconnectTimeout);
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "notification":
          store.dispatch(addNotification(data.payload));
          break;
        case "unread_count":
          store.dispatch(updateUnreadCount(data.payload));
          break;
        case "message":
          // Handle real-time messages
          break;
        case "post_update":
          // Handle post updates
          break;
        case "user_activity":
          // Handle user activity updates
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  }

  handleError(error) {
    console.error("WebSocket error:", error);
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  // Helper methods for specific message types
  sendUserActivity(activity) {
    this.send("user_activity", activity);
  }

  sendTypingStatus(conversationId, isTyping) {
    this.send("typing_status", { conversationId, isTyping });
  }

  sendReadReceipt(messageId) {
    this.send("read_receipt", { messageId });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

// Auto-connect when token changes
let previousToken = null;
store.subscribe(() => {
  const currentToken = store.getState().auth.token;
  if (currentToken !== previousToken) {
    previousToken = currentToken;
    if (currentToken) {
      websocketService.connect();
    } else {
      websocketService.disconnect();
    }
  }
});

export default websocketService;
