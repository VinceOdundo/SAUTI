import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ToastContext } from "./ToastContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io(
      process.env.REACT_APP_API_URL || "http://localhost:5000",
      {
        auth: { token },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      showToast("Lost connection to server", "error");
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [showToast]);

  const value = {
    socket,
    connected,
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
