require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./backend/config/db');
const authRoutes = require('./backend/routes/auth');
const chatRoutes = require('./backend/routes/chat');
const Message = require('./backend/models/Message');
const { userSocketMap } = require('./backend/utils/socketMap');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket Logic
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }

    // Handle Sending Messages
    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        // 1. Save to DB first to generate the unique _id
        const newMessage = await Message.create({ senderId, receiverId, message });

        const receiverSocketId = userSocketMap[receiverId];
        const senderSocketId = userSocketMap[senderId];

        // 2. Send to Receiver (Real-time)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', { 
                senderId, 
                message, 
                _id: newMessage._id // Send the DB ID
            });
        }
        
        // 3. Send back to Sender (So the UI can attach the ID to the delete button)
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageSent', {
                receiverId, 
                message, 
                _id: newMessage._id 
            });
        }
    });

    // Handle Deleting Messages (Real-time)
    socket.on('deleteMessage', ({ msgId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', msgId);
        }
    });

    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));