# WhatsApp Clone - Real-time Chat Application

Full-featured real-time messaging application with Socket.io, React, Node.js, and MongoDB.

## Features

- 💬 Real-time messaging with Socket.io
- 👥 Group chats with admin controls
- 📷 Media sharing (images, videos, documents)
- ✅ Read receipts and delivery status
- 🟢 Online/offline status
- ⌨️ Typing indicators
- 🔍 Search messages and contacts
- 📱 Mobile responsive (WhatsApp Web style)

## Tech Stack

- **Frontend**: React, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB with Mongoose
- **Auth**: JWT tokens + bcrypt

## Getting Started

```bash
git clone https://github.com/iabhishek18/whatsapp-clone-realtime.git
cd whatsapp-clone-realtime

# Start server
cd server && npm install && npm run dev

# Start client (in another terminal)
cd client && npm install && npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing key |
| CLIENT_URL | Frontend URL for CORS |

## License

MIT
