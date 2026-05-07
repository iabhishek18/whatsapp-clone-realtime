# WhatsApp Clone — Real-Time Chat Application

> Production-grade real-time messaging platform with end-to-end Socket.io communication, group chats, media sharing, and typing indicators.

## 🚀 Overview

A full-featured WhatsApp Web clone that demonstrates real-time bidirectional communication using Socket.io. The application supports private and group messaging, read receipts, online status tracking, and media sharing — all synchronized in real-time across connected clients.

Built with a clean separation between the Express/Socket.io backend and a React frontend, making it easy to understand, extend, and deploy.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 Real-Time Messaging | Instant message delivery via Socket.io WebSockets |
| 👥 Group Chats | Create groups with admin controls and member management |
| 📷 Media Sharing | Send images, videos, documents, and audio messages |
| ✅ Read Receipts | Double-tick system showing delivered and read status |
| 🟢 Online Status | Real-time online/offline indicators with last seen |
| ⌨️ Typing Indicators | "User is typing..." notification in real-time |
| 🔍 Message Search | Search through conversations and contacts |
| 📱 Responsive UI | WhatsApp Web-style layout that works on all screens |
| 🔐 JWT Authentication | Secure token-based auth with bcrypt password hashing |
| 💾 Message Persistence | All messages stored in MongoDB with pagination |

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Node.js + Express | REST API server |
| Real-Time | Socket.io | WebSocket communication |
| Database | MongoDB + Mongoose | Document storage with schemas |
| Auth | JWT + bcrypt | Secure authentication |
| Frontend | React + Tailwind CSS | User interface |
| State | Context API | Socket & auth state |

## 📁 Project Structure

```
whatsapp-clone-realtime/
├── server/
│   ├── src/
│   │   ├── index.ts           # Express + Socket.io server setup
│   │   ├── models/
│   │   │   ├── User.ts        # User schema (name, email, status, online)
│   │   │   ├── Message.ts     # Message schema (text, media, read receipts)
│   │   │   └── Chat.ts        # Chat schema (1-on-1, groups)
│   │   ├── routes/
│   │   │   ├── auth.ts        # Register, login endpoints
│   │   │   ├── chat.ts        # Chat CRUD
│   │   │   └── message.ts     # Message history with pagination
│   │   └── socket/
│   │       └── handler.ts     # Socket event handlers (message, typing, read)
│   ├── tsconfig.json
│   └── package.json
├── client/                     # React frontend (planned)
├── .env.example
└── .gitignore
```

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+
- **MongoDB** 6+ (local or Atlas)

### Installation

```bash
git clone https://github.com/iabhishek18/whatsapp-clone-realtime.git
cd whatsapp-clone-realtime

# Install server dependencies
cd server
npm install

# Configure environment
cp ../.env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

Server runs at `http://localhost:5000`.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `CLIENT_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

## 📡 API Reference

### Authentication
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Get JWT token |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats/:userId` | Get user's chats |
| POST | `/api/chats` | Create chat/group |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:chatId` | Get messages (paginated) |

### Socket Events

| Event (Client → Server) | Payload | Description |
|--------------------------|---------|-------------|
| `message:send` | `{chatId, content, type}` | Send a message |
| `message:read` | `{chatId, messageIds}` | Mark messages as read |
| `typing:start` | `{chatId}` | Notify typing started |
| `typing:stop` | `{chatId}` | Notify typing stopped |

| Event (Server → Client) | Payload | Description |
|--------------------------|---------|-------------|
| `message:received` | Message object | New message arrived |
| `message:read` | `{chatId, readBy}` | Read receipt update |
| `user:online` | `{userId, isOnline}` | Status change |

## 🏗️ Architecture

```
React Client ←→ Socket.io ←→ Express Server ←→ MongoDB
     ↕                              ↕
  Context API                  Mongoose ODM
```

## 📄 License

MIT
