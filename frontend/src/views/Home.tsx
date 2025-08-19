// PlaylistCreator.tsx (React + fetch)
import { useState } from "react";

export default function PlaylistCreator() {
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [playlistName, setPlaylistName]=useState<string>('')
  const backend = "http://127.0.0.1:4000";

  // open login in same tab — server redirects back to frontend
  const handleLogin = () => {
    window.location.href = `${backend}/login`;
  };

  const handleCreate = async () => {
    setCreating(true);
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    try {
      const resp = await fetch('http://127.0.0.1:4000/create-playlist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // CRUCIAL!
        body: JSON.stringify({ songs: lines, name: playlistName, public: false })
        })
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ err });
    } finally {
      setCreating(false);
    }
  };
  
  const handleInputChange = (e) => {
    e.preventDefault()
    setPlaylistName(e.target.value)
  }

  return (
    <div style={{ maxWidth: 720, margin: "auto", padding: 20 }}>
  

      <p>
        <button onClick={handleLogin}>Log in with Spotify</button>
        &nbsp;
        <a href="/logout">Logout</a>
      </p>
      <label>nombre de la playlist</label>
        <input id="playlistName" onChange={handleInputChange}/>
      <textarea
        rows={12}
        style={{ width: "100%" }}
        //placeholder="Paste song titles, one per line. Format examples: 'Billie Jean - Michael Jackson' or 'Numb' or approximate names..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={handleCreate} disabled={creating || !text.trim()}>
          {creating ? "Creando..." : "Crear Playlist"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.url ? (
            <div>
              ✅ Creada: <a href={result.url} target="_blank" rel="noreferrer">{result.url}</a>
              {/* <div>{result.added} tracks added.</div> */}
            </div>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
