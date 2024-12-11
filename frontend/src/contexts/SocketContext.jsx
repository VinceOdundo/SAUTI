import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { showToast } = useToast();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const baseReconnectTimeout = 1000;

  const connect = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:5000";
    const socketInstance = new WebSocket(`${wsUrl}/ws?token=${token}`);

    socketInstance.onopen = () => {
      console.log("Socket connected");
      setConnected(true);
      setReconnectAttempts(0);
    };

    socketInstance.onclose = (event) => {
      console.log("Socket disconnected");
      setConnected(false);

      if (reconnectAttempts < maxReconnectAttempts) {
        const timeout = baseReconnectTimeout * Math.pow(2, reconnectAttempts);
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connect();
        }, timeout);
      }
    };

    socketInstance.onerror = (error) => {
      console.error("Socket connection error:", error);
      showToast("Lost connection to server", "error");
    };

    socketInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    setSocket(socketInstance);
    return socketInstance;
  };

  useEffect(() => {
    const socketInstance = connect();
    return () => {
      if (socketInstance) {
        socketInstance.close();
      }
    };
  }, []);

  const value = {
    socket,
    connected,
    connect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
