import { io } from "socket.io-client";

export const initSocket = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not defined');
  }

  const options = {
    "force new connection": true,
    reconnectionAttempt: "5",
    timeout: 10000,
    transports: ["websocket"],
  };

  // socket client instance
  return io(backendUrl, options);
};