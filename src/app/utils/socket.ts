import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { envVars } from "../config/env";

export let io: SocketIOServer;
const userSocketMap = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }
    try {
      const decoded = jwt.verify(token, envVars.JWT_ACCESS_SECRET as string) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`⚡ User connected: ${userId} (Socket: ${socket.id})`);
    }

    // Join room for a specific conversation
    socket.on("join_room", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`👥 User joined room: ${conversationId}`);
    });

    socket.on("disconnect", () => {
      if (userId) {
        userSocketMap.delete(userId);
        console.log(`🔌 User disconnected: ${userId}`);
      }
    });
  });
};

export const getRecipientSocketId = (recipientId: string): string | undefined => {
  return userSocketMap.get(recipientId);
};
