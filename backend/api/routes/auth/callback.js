import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import { oauthStates } from './oAuthStates.js';


const {
  CLIENT_ID,
  REDIRECT_URI,
  SPOTIFY_ACCOUNTS,
  CLIENT_SECRET,
  API_BASE,
  FRONTEND_URI
} = process.env;

const router = express.Router()



router.get("/", async (req, res) => {//----/callback
  const code = req.query.code;
  const state = req.query.state;
  
  console.log("Callback received:");
  console.log('req.session', req.session)
  console.log("- State from query:", state);
  console.log("- State from session:", req.session.oauth_state);
  console.log("- State in temp store:", oauthStates.has(state));
  console.log("- Session ID:", req.sessionID);

  // Check state in temporary store first, then session as fallback
  if (!state || (!oauthStates.has(state) && state !== req.session.oauth_state)) {
    console.log("State validation failed!");
    return res.status(400).send("Invalid state or missing code");
  }

  // Remove state from temporary store
  oauthStates.delete(state);

  try {
    // exchange code for tokens
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange failed:", errorText);
      return res.status(400).send("Token exchange failed");
    }
    
    const data = await response.json();

    // Store tokens in session
    req.session.access_token = data.access_token;
    req.session.refresh_token = data.refresh_token;
    req.session.token_expires_at = Date.now() + (data.expires_in * 1000);

    console.log("Tokens stored, fetching user info...");

    // Fetch and store user info
    const userResp = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    
    if (userResp.ok) {
      const user = await userResp.json();
      req.session.spotify_user = user;
      console.log("User stored:", user.id);
    } else {
      console.error("Failed to fetch user info:", await userResp.text());
      return res.status(400).send("Failed to fetch user information");
    }

    // redirect back to frontend
    res.redirect(FRONTEND_URI);
    
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).send("Authentication failed");
  }
});

export default router