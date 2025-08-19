// server.js
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";

import authStatus from './api/routes/auth/authStatus.js'
import callbackRoute from './api/routes/auth/callback.js'
import createPlaylist from './api/routes/createPlaylist/createPlaylist.js'
import login from './api/routes/login/login.js'
import logout from './api/routes/logout/logout.js'

dotenv.config();

const {
  FRONTEND_URI = "http://localhost:5173",
  PORT = 4000,
  SESSION_SECRET = "dev-secret"
} = process.env;

const app = express();
app.use(express.json());

// Allow requests from frontend and include cookies
app.use(cors({
  origin: FRONTEND_URI,
  credentials: true
}));

// OAuth state temporary store
const oauthStates = new Map();

// Clean up old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, timestamp] of oauthStates.entries()) {
    if (now - timestamp > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(state);
    }
  }
}, 10 * 60 * 1000);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'connect.sid', // Use default session name
  cookie: {
  maxAge: 24*60*60*1000,
  sameSite: "lax",
  secure: false
}
}));

app.use('/callback', callbackRoute)
app.use('/login', login)
app.use('/auth-status', authStatus)
app.use('/create-playlist', createPlaylist)
app.use('/logout', logout)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});