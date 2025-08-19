import fetch from "node-fetch";
import dotenv from 'dotenv'
dotenv.config();

const {
  API_BASE,
  SPOTIFY_ACCOUNTS,
  CLIENT_ID,
  CLIENT_SECRET
} = process.env;

async function refreshAccessToken(refresh_token) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token
  });

  const resp = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error("Refresh failed: " + text);
  }

  return resp.json(); // may contain new access_token and expires_in
}

export async function ensureAccessToken(req, res, next) {
  console.log("Checking authentication...");
  console.log("- Session ID:", req.sessionID);
  console.log("- Has access token:", !!req.session.access_token);
  console.log("- Has user:", !!req.session.spotify_user);
  
  if (!req.session || !req.session.access_token) {
    console.log("No access token in session");
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Check if we have user info, if not fetch it
  if (!req.session.spotify_user) {
    console.log("No user info, fetching...");
    try {
      const userResp = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${req.session.access_token}` }
      });
      
      if (userResp.ok) {
        const user = await userResp.json();
        req.session.spotify_user = user;
        console.log("User info fetched:", user.id);
      } else {
        console.log("Failed to fetch user info, token might be expired");
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  // refresh if expired (give a small margin)
  if (req.session.token_expires_at && Date.now() > (req.session.token_expires_at - 60 * 1000)) {
    console.log("Token expired, refreshing...");
    try {
      const ref = await refreshAccessToken(req.session.refresh_token);
      req.session.access_token = ref.access_token;
      if (ref.refresh_token) req.session.refresh_token = ref.refresh_token;
      if (ref.expires_in) req.session.token_expires_at = Date.now() + ref.expires_in * 1000;
      console.log("Token refreshed successfully");
    } catch (err) {
      console.error("Could not refresh token:", err);
      return res.status(401).json({ error: "Token refresh failed" });
    }
  }
  next();
}