const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const myId = localStorage.getItem('userId');
let selectedReceiverId = null;
let socket;

// Selectors
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const userList = document.getElementById('userList');
const messagesContainer = document.getElementById('messages');
const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msgInput');
const deleteChatBtn = document.getElementById('deleteChatBtn');

// --- Auth Logic (Login/Signup) ---
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);
            window.location.href = 'chat.html';
        } else {
            document.getElementById('errorMsg').innerText = data.error;
        }
    });

    signupBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (res.ok) alert('Signup successful! Please login.');
        else alert('Error signing up');
    });
}

// --- Chat Page Logic ---
if (userList) {
    if (!token) window.location.href = 'index.html';
    document.getElementById('currentUser').innerText = localStorage.getItem('username');

    // 1. Initialize Socket
    socket = io({ query: { userId: myId } });

    // 2. Socket Listener: New Message from Others
    socket.on('newMessage', (data) => {
        if (selectedReceiverId === data.senderId) {
            appendMessage(data._id, data.message, 'received');
            scrollToBottom();
        } else {
            // Optional: Visual indicator for new msg from other user
            const userItem = document.getElementById(`user-${data.senderId}`);
            if (userItem) userItem.style.fontWeight = "bold";
        }
    });

    // 3. Socket Listener: Message Confirmation (My sent message)
    socket.on('messageSent', (data) => {
        if (data.receiverId === selectedReceiverId) {
            appendMessage(data._id, data.message, 'sent');
            scrollToBottom();
        }
    });

    // 4. Socket Listener: Message Deleted
    socket.on('messageDeleted', (msgId) => {
        const msgElement = document.getElementById(`msg-${msgId}`);
        if (msgElement) msgElement.remove();
    });

    // 5. Socket Listener: Online Users
    socket.on('getOnlineUsers', (users) => {
        document.querySelectorAll('.online-dot').forEach(el => el.style.display = 'none');
        users.forEach(id => {
            const dot = document.getElementById(`dot-${id}`);
            if (dot) dot.style.display = 'inline-block';
        });
    });

    // Load Users
    async function loadUsers() {
        const res = await fetch(`${API_URL}/chat/users`, { headers: { 'Authorization': token } });
        const users = await res.json();
        userList.innerHTML = users.map(user => `
            <div class="user-item" onclick="selectUser('${user._id}', '${user.username}')" id="user-${user._id}">
                <span class="online-dot" id="dot-${user._id}" style="display:none"></span>
                ${user.username}
            </div>
        `).join('');
    }
    loadUsers();

    // Select a User to Chat
    window.selectUser = function(id, username) {
        selectedReceiverId = id;
        localStorage.setItem('selectedUserId', id);
        document.getElementById('chatWithUser').innerText = `Chatting with ${username}`;
        deleteChatBtn.style.display = 'block';

        document.querySelectorAll('.user-item').forEach(el => {
            el.classList.remove('active');
            el.style.fontWeight = "normal";
        });
        document.getElementById(`user-${id}`).classList.add('active');
        
        loadMessages(id);
    }

    // Load Chat History
    async function loadMessages(receiverId) {
        messagesContainer.innerHTML = '';
        const res = await fetch(`${API_URL}/chat/messages/${receiverId}`, { headers: { 'Authorization': token } });
        const messages = await res.json();
        messages.forEach(msg => {
            appendMessage(msg._id, msg.message, msg.senderId === myId ? 'sent' : 'received');
        });
        scrollToBottom();
    }

    // Append Message to UI
    function appendMessage(msgId, msg, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.id = `msg-${msgId}`;
        
        const textSpan = document.createElement('span');
        textSpan.innerText = msg;
        div.appendChild(textSpan);

        // Add Delete "X" Button only for sent messages
        if (type === 'sent') {
            const deleteSpan = document.createElement('span');
            deleteSpan.innerHTML = ' &times;';
            deleteSpan.style.cursor = 'pointer';
            deleteSpan.style.marginLeft = '10px';
            deleteSpan.style.fontSize = '1.2rem';
            deleteSpan.style.opacity = '0.7';
            deleteSpan.title = "Delete message";
            
            deleteSpan.onclick = () => deleteMessage(msgId);
            
            div.appendChild(deleteSpan);
        }

        messagesContainer.appendChild(div);
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send Message Function
    function sendMessage() {
        const message = msgInput.value;
        if (!message || !selectedReceiverId) return;

        msgInput.value = ''; // Clear input
        // Emit to server
        socket.emit('sendMessage', { senderId: myId, receiverId: selectedReceiverId, message });
    }

    // Delete Specific Message
    async function deleteMessage(msgId) {
        if(!confirm("Delete this message?")) return;

        const res = await fetch(`${API_URL}/chat/message/${msgId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (res.ok) {
            document.getElementById(`msg-${msgId}`).remove();
            socket.emit('deleteMessage', { msgId, receiverId: selectedReceiverId });
        } else {
            alert("Failed to delete message");
        }
    }

    // Delete Entire Conversation
    deleteChatBtn.addEventListener('click', async () => {
        if(!selectedReceiverId) return;
        if(!confirm("Are you sure you want to delete the entire conversation? This cannot be undone.")) return;

        const res = await fetch(`${API_URL}/chat/conversation/${selectedReceiverId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (res.ok) {
            messagesContainer.innerHTML = ''; // Clear UI
            alert("Chat cleared successfully.");
        }
    });

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    
    msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}