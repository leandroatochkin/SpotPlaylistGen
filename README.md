# 🎵 Spotify OAuth Starter App  

A full-stack application that demonstrates how to authenticate with **Spotify** using OAuth2.  
The app has a **React (Vite) frontend** and a **Node.js + Express backend** with session management.  

---

## 🚀 Features
- 🔑 **Spotify OAuth Login** (Authorization Code Flow)  
- 🎟️ **Session handling** with Express + cookies  
- 👤 Authenticated user info fetched from Spotify (`id`, `display_name`)  
- 🚪 **Logout** (clears session + redirects back to frontend)  
- 🔄 **Frontend state sync** (`isLoggedIn`) with backend session status  
- ⚡ Built with **React + Vite** and **Express**  

---

## 🛠️ Tech Stack
**Frontend**
- React + Vite  
- TypeScript (optional, depending on your setup)  

**Backend**
- Node.js + Express  
- express-session for session storage  
- dotenv for config  
- cors for cross-origin support  

---

## 📦 Installation

Clone the repo:
```sh
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

Backend
```
cd backend
npm install
```

Create a .env file in backend/:

```
PORT=4000
FRONTEND_URI=http://127.0.0.1:5173
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:4000/callback
SESSION_SECRET=supersecret
```


Run the backend:

```
node server.js
```
Frontend
```
cd frontend
npm install
npm run dev 
```

🔑 Usage

Go to http://127.0.0.1:5173

Click Login with Spotify → redirected to Spotify auth

After login, redirected back to frontend

UI updates with your Spotify profile info

Click Logout → session destroyed, redirected back to frontend