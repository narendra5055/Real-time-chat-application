let socket;

function connectSocket(userId) {
    socket = io({
        query: { userId }
    });

    // Listen for new messages globally
    socket.on('newMessage', (data) => {
        const currentChatUser = localStorage.getItem('selectedUserId');
        if (currentChatUser === data.senderId) {
            appendMessage(data.message, 'received');
        } else {
            // Ideally, show a notification badge on the user in the sidebar
            alert("New message from someone!");
        }
    });

    socket.on('getOnlineUsers', (users) => {
        // Update green dots in sidebar
        updateOnlineStatus(users);
    });
}