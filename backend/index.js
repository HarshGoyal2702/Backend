import express from "express"
import { connectDB } from "./connectDB.js";
import cors from "cors"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http"
import { Server } from "socket.io"
import DisasterRoute from "./routes/disaster.routes.js"

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
const PORT = process.env.PORT || 8080;

dotenv.config({
    path: "backend/.env"
})
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/api/v1/disaster', DisasterRoute)

server.listen(PORT, () => {
    console.log(PORT)
    connectDB();
});
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
export default io;