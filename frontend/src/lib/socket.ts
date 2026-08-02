import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
      "/api",
      ""
    );
    socket = io(url);
  }
  return socket;
}