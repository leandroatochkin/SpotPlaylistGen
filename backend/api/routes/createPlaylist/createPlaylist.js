import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import { findBestTrack } from '../../../helpers/helpers.js';
import fetch from "node-fetch";
import { ensureAccessToken } from '../../../api/middleware/middleware.js';

const {
    API_BASE
} = process.env;

const router = express.Router()

router.post("/", ensureAccessToken, async (req, res) => {//-----/create-playlist
  try {
    const { songs = [], name, public: isPublic = false } = req.body;
    console.log("Creating playlist:", { songsCount: songs.length, name, isPublic });
    
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: "No songs provided" });
    }

    const accessToken = req.session.access_token;

    // Get user ID
    let userId = req.session.spotify_user?.id;
    if (!userId) {
      console.log("No user ID in session, fetching...");
      // fallback: fetch /me
      const meResp = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!meResp.ok) {
        console.error("Could not fetch user:", await meResp.text());
        return res.status(401).json({ error: "Could not fetch user information" });
      }
      const meJson = await meResp.json();
      req.session.spotify_user = meJson;
      userId = meJson.id;
    }

    console.log("Using user ID:", userId);

    // search every song line and collect URIs
    const uris = [];
    const matchedSongs = [];
    const unmatchedSongs = [];
    
    for (const raw of songs) {
      const line = ("" + raw).trim();
      if (!line) continue;
      try {
        const track = await findBestTrack(accessToken, line);
        if (track) {
          uris.push(track.uri);
          matchedSongs.push({ input: line, track: track.name, artists: track.artists.map(a => a.name).join(", ") });
        } else {
          console.warn("No good match for:", line);
          unmatchedSongs.push(line);
        }
      } catch (err) {
        console.error("Search error for line:", line, err);
        unmatchedSongs.push(line);
      }
    }

    console.log(`Matched ${uris.length} songs, ${unmatchedSongs.length} unmatched`);

    if (uris.length === 0) return res.status(400).json({ error: "No tracks matched" });

    // create playlist
    console.log("Creating playlist for user:", userId);
    const createResp = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        public: isPublic, // Note: it's "public" not "isPublic" in Spotify API
        description: "Created with the playlist-generator app"
      })
    });

    if (!createResp.ok) {
      const errorText = await createResp.text();
      console.error("Playlist creation failed:", errorText);
      return res.status(createResp.status).json({ error: "Failed to create playlist: " + errorText });
    }

    const playlist = await createResp.json();
    console.log("Playlist created:", playlist.id);

    // add tracks in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < uris.length; i += chunkSize) {
      const chunk = uris.slice(i, i + chunkSize);
      const addResp = await fetch(`${API_BASE}/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: chunk })
      });

      if (!addResp.ok) {
        const text = await addResp.text();
        console.error("Failed to add tracks:", text);
      }
    }

    console.log("Playlist created successfully");
    res.json({ 
      url: playlist.external_urls.spotify, 
      id: playlist.id, 
      added: uris.length,
      matched: matchedSongs,
      unmatched: unmatchedSongs
    });
  } catch (err) {
    console.error("Create playlist error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router