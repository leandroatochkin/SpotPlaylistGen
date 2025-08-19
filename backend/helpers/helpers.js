
import fetch from "node-fetch";
import dotenv from 'dotenv'
dotenv.config();

const {
  SPOTIFY_ACCOUNTS,
  API_BASE,
} = process.env;




/* ---------- Helper: exchange code for tokens ---------- */
export async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI
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
    throw new Error("Token exchange failed: " + text);
  }

  return resp.json(); // contains access_token, token_type, expires_in, refresh_token, scope
}

/* ---------- Helper: refresh token ---------- */
export async function refreshAccessToken(refresh_token) {
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

function norm(s = "") {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .trim();
}

function levenshtein(a, b) {
  // careful digit-by-digit DP
  const A = a.split("");
  const B = b.split("");
  const m = A.length, n = B.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = A[i - 1] === B[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarityScore(input, candidate) {
  const a = norm(input);
  const b = norm(candidate);
  if (!a || !b) return 0;
  const lev = levenshtein(a, b);
  // convert to 0..1 where 1 is exact match
  const maxLen = Math.max(a.length, b.length);
  return 1 - (lev / maxLen);
}

export async function findBestTrack(accessToken, rawLine) {
  const line = (rawLine || "").trim();
  if (!line) return null;

  // try to parse "title - artist" common format
  let q = line;
  let title = null;
  let artist = null;
  const sep = line.includes(" - ") ? " - " : (line.includes("—") ? "—" : null);
  if (sep) {
    const parts = line.split(sep).map(p => p.trim());
    if (parts.length >= 2) {
      title = parts[0];
      artist = parts.slice(1).join(" ");
      // build a targeted query
      q = `track:${title} artist:${artist}`;
    }
  } else {
    // put the whole thing as track search, Spotify will attempt matching
    q = `track:${line}`;
  }

  // fetch top 5 candidates
  const params = new URLSearchParams({ q, type: "track", limit: "5" });
  const resp = await fetch(`${API_BASE}/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!resp.ok) {
    // maybe server responded 401 or other issue
    // bubble up
    const txt = await resp.text();
    throw new Error("Search failed: " + txt);
  }
  const data = await resp.json();
  const items = data.tracks?.items || [];
  if (items.length === 0) return null;

  // compute best by similarity to "title - artist"
  const target = title ? `${title} - ${artist}` : line;
  let best = null;
  let bestScore = -1;
  for (const item of items) {
    const artists = item.artists.map(a => a.name).join(", ");
    const candidate = `${item.name} - ${artists}`;
    const score = similarityScore(target, candidate);
    // small boost if popularity matches or exacturi?
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  // threshold to avoid false matches (tune as you need)
  if (bestScore < 0.35) return null;
  return best;
}