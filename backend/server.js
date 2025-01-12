const express = require('express');
const http = require('http'); // For creating the server
const { Server } = require('socket.io'); // For WebSocket functionality
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Importing routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teammateRoutes = require('./routes/teamsRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Create the HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teammates', teammateRoutes);

// MongoDB connection
const uri = "mongodb://localhost:27017/project3100";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected...');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));

// Socket.IO functionality
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Event listeners
  socket.on("send_message", (msg) => {
    console.log("Message received:", msg);
    socket.broadcast.emit("recieve_message", msg);
  });

  socket.on("user_typing", (data) => {
    console.log("User typing:", data);
    socket.broadcast.emit("user_typing", data);
  });

  socket.on("new_user", (data) => {
    console.log("New user joined:", data);
    socket.broadcast.emit("new_user", data.user);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Export app for testing or additional configurations
module.exports = app;
