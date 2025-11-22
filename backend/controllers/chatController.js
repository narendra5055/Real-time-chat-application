const User = require('../models/User');
const Message = require('../models/Message');

// Get all users (except self)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a specific message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        
        if (!message) return res.status(404).json({ error: "Message not found" });

        // Verify the user deleting it is the one who sent it
        if (message.senderId.toString() !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete entire conversation
exports.deleteConversation = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user.id;

        // Delete all messages where (Sender is Me AND Receiver is Them) OR (Sender is Them AND Receiver is Me)
        await Message.deleteMany({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId }
            ]
        });

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};