# Wevoc Project 🎙️

**Wevoc** is a modern, real-time voice and audio social platform built with Node.js, Express, MongoDB, Socket.IO, and React (Vite). It allows users to record, share, discover voice snippets, join campus communities, and chat in real-time through voice direct messaging.

---

## 🌟 Key Features

- **🎙️ Voice Sharing & Snippets**: Record and publish audio posts with title, description, waveform preview, and custom tags.
- **💬 Real-Time Voice DMs**: Direct 1-on-1 audio messaging powered by Socket.IO with real-time delivery, typing indicators, and read receipts.
- **👥 Campus Communities**: Join and participate in specialized voice channels and discussions.
- **🔥 Trending & Social Feed**: Discover trending audio posts, follow friends, and listen to a personalized feed.
- **📁 Playlists & Bookmarks**: Save favorite voice recordings into custom playlists and access saved bookmarks instantly.
- **🔔 Interactive Notifications**: Get notified when people like, comment, or interact with your voice posts.
- **🛡️ Admin & Moderation**: Admin dashboard to review content and manage community safety.

---

## 📁 Project Structure

The project is structured into cleanly separated, synchronized backend and frontend workspaces:

```
wevoc-project/
├── backend/                      # Express, MongoDB, & Socket.IO API server
│   ├── src/
│   │   ├── config/               # Cloudinary media uploads & configuration
│   │   ├── controllers/          # Business logic (voices, messages, communities, etc.)
│   │   ├── db/                   # MongoDB connection lifecycle
│   │   ├── middleware/           # JWT auth, multer file handling, admin guards
│   │   ├── models/               # Mongoose data models
│   │   ├── routes/               # Express REST API endpoints
│   │   ├── sockets/              # Socket.IO handlers (events, rooms, presence)
│   │   ├── utils/                # ApiError, ApiResponse, asyncHandler utilities
│   │   ├── app.js                # Express app setup, CORS, JSON parsers & routes
│   │   └── index.js              # Server entry point (HTTP + Socket.IO + Database)
│   ├── public/temp/              # Local scratch space for file uploads
│   ├── .env.example              # Backend environment template
│   └── package.json              # Backend dependencies and scripts
│
├── frontend/                     # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── api/                  # Unified API client and endpoint services
│   │   ├── components/           # UI elements (Waveform, PostCard, ComposeBox, etc.)
│   │   ├── context/              # Global state (user session, active playback, audio)
│   │   ├── pages/                # Views (Feed, Dms, Communities, Explore, Profile, Admin)
│   │   ├── socket.js             # Client-side Socket.IO connection manager
│   │   ├── styles/               # Modern CSS & aesthetic design system
│   │   ├── App.jsx               # Application router & main layout
│   │   └── main.jsx              # React client entry point
│   ├── .env.example              # Frontend environment template
│   ├── vite.config.js            # Vite configuration & dev server
│   └── package.json              # Frontend dependencies and scripts
│
├── package.json                  # Root monorepo orchestration
├── .env.example                  # Full-stack environment reference guide
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster

### 2. Installation
Clone the repository and install all dependencies across the entire project with a single command:

```bash
git clone https://github.com/sunil-kumar39/wevoc-backend.git wevoc-project
cd wevoc-project

# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Environment Setup

#### Backend Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Fill in your credentials:
```env
PORT=8000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wevoc?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend Configuration
Create a `.env` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env
```
Set the API endpoint:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 💻 Development & Execution

### Run Full Stack (Concurrently)
To run both backend (port 8000) and frontend (port 5173) together with unified colored logs:

```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### Individual Service Commands
Run services individually when debugging or working on a single layer:

| Command | Action |
|---|---|
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run dev:backend` | Start backend with nodemon hot-reload |
| `npm run dev:frontend` | Start frontend Vite development server |
| `npm run build` | Build frontend production bundle |
| `npm run start:backend` | Run backend in production mode |

---

## 🔄 Backend & Frontend Synchronization

- **Authentication & Cookies**: JWT access and refresh tokens are stored in HTTP-only cookies (`withCredentials: true`), securing requests between `http://localhost:5173` and `http://localhost:8000`.
- **WebSocket Gateway**: Frontend dynamically derives the Socket.IO server URL from `VITE_API_URL`, synchronizing live messaging (`message:new`), read markers (`messages:read`), and online presence (`user:online`).
- **Unified JSON Error Responses**: Express middleware intercepts all unhandled errors and maps them to a consistent `{ statusCode, success: false, message, errors }` format, ensuring clean user feedback on the frontend without unexpected JSON parse failures.

---

## 📄 License
This project is licensed under the ISC License.
