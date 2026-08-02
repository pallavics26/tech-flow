import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app";

const PORT = process.env.PORT || 5000;

// Wrap Express app in a plain HTTP server so Socket.io can attach to it
const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Track which users are active on which boards: boardId -> Map<socketId, userInfo>
const boardPresence = new Map<string, Map<string, { userId: string; name: string }>>();

function broadcastPresence(boardId: string) {
  const users = boardPresence.get(boardId);
  const list = users ? Array.from(users.values()) : [];
  io.to(`board:${boardId}`).emit("presence:update", list);
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  let currentBoardId: string | null = null;

  socket.on("join-board", (data: { boardId: string; userId: string; name: string }) => {
    const { boardId, userId, name } = data;
    currentBoardId = boardId;
    socket.join(`board:${boardId}`);

    if (!boardPresence.has(boardId)) {
      boardPresence.set(boardId, new Map());
    }
    boardPresence.get(boardId)!.set(socket.id, { userId, name });

    broadcastPresence(boardId);
  });

  socket.on("leave-board", (boardId: string) => {
    socket.leave(`board:${boardId}`);
    boardPresence.get(boardId)?.delete(socket.id);
    broadcastPresence(boardId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    if (currentBoardId) {
      boardPresence.get(currentBoardId)?.delete(socket.id);
      broadcastPresence(currentBoardId);
    }
  });
});
httpServer.listen(PORT, () => {
  console.log(`🚀 Tech-Flow API running on http://localhost:${PORT}`);
});
