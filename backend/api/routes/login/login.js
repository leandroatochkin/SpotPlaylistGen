import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import { oauthStates } from '../auth/oAuthStates.js';
import querystring from "querystring";

const {
  CLIENT_ID,
  REDIRECT_URI,
  SPOTIFY_ACCOUNTS
} = process.env;

const router = express.Router()

router.get("/", (req, res) => {//--/login
  const state = Math.random().toString(36).substring(2, 15);
  
  console.log("Login route:");
  console.log("- Generated state:", state);
  console.log("- Session ID:", req.sessionID);
  
  // Store state in both session AND temporary store
  req.session.oauth_state = state;
  oauthStates.set(state, Date.now());
  
  const scope = [
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-email"
  ].join(" ");

  const params = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });
  console.log('authorize params:', params)
  res.redirect(`${SPOTIFY_ACCOUNTS}/authorize?${params}`);
});

export default router