import express from "express";
import http from "http";
import { Server } from "socket.io";
import Actions from "./src/EventActions.js";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

const __filename = fileURLToPath(import.meta.url); // Getting the current file's path
const __dirname = path.dirname(__filename); // Getting the current file's directory path

const server = http.createServer(app); // Creating an HTTP server using the express app
const io = new Server(server); // Creating a socket.io server instance

app.use(express.static("dist")); // Serving static files from the "dist" directory
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // Serving the index.html file from the "dist" directory
});

// Socket mapping
const socketMap = {}; // Object to map socket IDs to usernames


const getAllClients = (id) => {
  // checking all the rooms in the adapters ad getting specific room
  return Array.from(io.sockets?.adapter?.rooms.get(id) || []).map(
    (userSocketId) => {
      return {
        userSocketId,
        userName: socketMap[userSocketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on(Actions.JOIN, ({ id, userName }) => {
    socketMap[socket.id] = userName; // Mapping the socket ID to the username
    socket.join(id); // Making the socket join the specified room

    const allClients = getAllClients(id); // Getting all clients in the room

    allClients.forEach(({ userSocketId }) => {
      // Emitting a JOINED event to every participant in the room
      io.to(userSocketId).emit(Actions.JOINED, {
        allClients,
        userName,
        userSocketId: socket.id,
      });
    });
    socket.on(Actions.CURSOR_MOVE, ({ id, cursor }) => {
      socket.to(id).emit(Actions.CURSOR_MOVE, {
        clientId: socket.id,
        cursor,
      });
    });
    socket.on(Actions.CHAT_MESSAGE, ({ id, message, userName }) => {
      io.to(id).emit(Actions.CHAT_MESSAGE, { message, userName });
    });
  });

  socket.on(Actions.CODE_CHANGE, ({ id, text }) => {
    // Emitting a CODE_CHANGE event to every client in the room except the sender
    socket.in(id).emit(Actions.CODE_CHANGE, { text });
  });

  socket.on(Actions.SYNC_CODE, ({ userSocketId, text }) => {
    // Emitting a CODE_CHANGE event to a specific client
    io.to(userSocketId).emit(Actions.CODE_CHANGE, { text });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms]; // Getting the rooms the socket is currently in

    rooms.forEach((id) => {
      // Emitting a DISCONNECTED event to every client in the room
      socket.in(id).emit(Actions.DISCONNECTED, {
        socketId: socket.id,
        userName: socketMap[socket.id],
      });
    });

    delete socketMap[socket.id]; // Removing the socket ID from the mapping

    socket.leave(); // Leaving the room
  });
});

const PORT = process.env.PORT || 8080; // Setting the server port

server.listen(PORT, (err, res) => {
  console.log(`Listening on ${PORT}`); // Starting the server and logging the port

  if (err) {
    console.log(err); // Logging any errors that occur during server startup
  }
});
