import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  const url = import.meta.env.VITE_SOCKET_URL ?? "/";

  socket = io(url, {
    auth: { token },
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const ensureSocket = (token) => {
  if (socket) return socket;
  if (!token) return null;
  return initSocket(token);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
