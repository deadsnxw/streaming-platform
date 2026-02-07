import dotenv from 'dotenv';
import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Новий користувач підключився:", socket.id);

    socket.on("join_chat", (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`Socket ${socket.id} приєднався до chat_${chatId}`);
    });

    socket.on("send_message", async ({ chatId, senderId, text }) => {
        const message = await import("./db/message.repository.js").then(mod =>
            mod.createMessage({ chatId, senderId, text })
        );

        io.to(`chat_${chatId}`).emit("new_message", message);
    });

    socket.on("disconnect", () => {
        console.log("Користувач відключився:", socket.id);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

export { io };