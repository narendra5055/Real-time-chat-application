# 💬 Narendra Chat - Realtime Chat Application

![Node](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-forestgreen)
![Status](https://img.shields.io/badge/Status-Active-blue)

A fully functional, **Full-Stack Realtime Chat Application** built using **Node.js, Express, MongoDB, and Socket.io**. It supports instant messaging, user authentication, online status indicators, and message management with a modern, responsive UI.

---

## 🚀 Key Features

- **🔐 User Authentication:** Secure Signup and Login using JWT (JSON Web Tokens) and Bcrypt for password hashing.
- **⚡ Real-time Messaging:** Instant 1-on-1 chat powered by Socket.io (no page refresh required).
- **🟢 Online Status:** See which users are currently online in real-time.
- **🗑️ Message Management:**
  - **Delete Message:** Remove specific messages from the chat history for both users.
  - **Clear Chat:** Delete the entire conversation history with a specific user.
- **📱 Responsive UI:** Mobile-friendly design with Glassmorphism effects and smooth animations.
- **🔔 Instant Notifications:** Visual cues when new messages arrive.

---

## 🔮 Future Roadmap & Extensions

The following features are planned for future updates:
- [ ] **📁 File & Image Sharing:** Ability to upload photos and documents.
- [ ] **👥 Group Chat:** Create rooms for multiple users to chat together.
- [ ] **😊 Emoji Support:** Native emoji picker integration.
- [ ] **🔔 Push Notifications:** Browser notifications when the app is in the background.
- [ ] **👀 Typing Indicators:** See when the other user is typing...

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server Runtime.
- **Express.js** - REST API Framework.
- **MongoDB & Mongoose** - NoSQL Database.
- **Socket.io** - Real-time bidirectional communication engine.
- **JWT & BcryptJS** - Security and Authentication.

### Frontend
- **HTML5** - Structure.
- **CSS3** - Custom styling (Flexbox, Grid, CSS Variables).
- **Vanilla JavaScript** - DOM manipulation and Socket client logic.

---

## 📂 Project Structure

```text
narendra-chat/
├── backend/
│   ├── config/         # Database connection (db.js)
│   ├── controllers/    # Logic for Auth and Chat operations
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB Schemas (User, Message)
│   ├── routes/         # API Routes (auth.js, chat.js)
│   └── utils/          # Socket helper functions
├── frontend/
│   ├── css/            # Stylesheets (style.css)
│   ├── js/             # Application Logic (app.js)
│   ├── chat.html       # Main Chat Interface
│   └── index.html      # Login/Signup Page
├── .env                # Environment Variables
├── package.json        # Project Dependencies
└── server.js           # Main Server Entry Point