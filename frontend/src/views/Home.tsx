// PlaylistCreator.tsx (React + fetch)
import { useState, useEffect } from "react";

export default function PlaylistCreator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [playlistName, setPlaylistName]=useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const backend = "http://127.0.0.1:4000";

  // open login in same tab — server redirects back to frontend
  const handleLogin = () => {
    window.location.href = `${backend}/login`;
  };

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const resp = await fetch(`${backend}/auth-status`, {
        credentials: "include",
      });
      const data = await resp.json();

      if (data.authenticated) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  checkAuth();
}, []);

    const handleLogout = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:4000/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // CRUCIAL!
        })
      if(resp.ok){
        setIsLoggedIn(false)
      }
    } catch (err) {
      console.error(err);    } 
  };

  const handleCreate = async () => {
    setIsCreating(true);
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
      setIsCreating(false);
    }
  };
  

  const styles = {
    container: {
      minHeight: "100dvh",
      minWidth: "100vw",
      backgroundColor: "#000000",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "320px",
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "8px",
      padding: "24px",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "24px",
    },
    title: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontSize: "24px",
      fontWeight: "bold",
      color: "#22c55e",
      margin: "0",
    },
    statusBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#27272a",
      borderRadius: "6px",
      border: "1px solid #3f3f46",
      marginBottom: "16px",
    },
    statusText: {
      fontSize: "14px",
      color: "#a1a1aa",
    },
    connectedText: {
      fontSize: "14px",
      color: "#22c55e",
      fontWeight: "500",
    },
    button: {
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    loginButton: {
      backgroundColor: "#22c55e",
      color: "#000000",
    },
    logoutButton: {
      backgroundColor: "transparent",
      color: "#d4d4d8",
      border: "1px solid #3f3f46",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#d4d4d8",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      borderRadius: "6px",
      color: "#ffffff",
      fontSize: "14px",
      boxSizing: "border-box" as const,
    },
    inputDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      borderRadius: "6px",
      color: "#ffffff",
      fontSize: "14px",
      resize: "none" as const,
      boxSizing: "border-box" as const,
    },
    createButton: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#22c55e",
      color: "#000000",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    createButtonDisabled: {
      backgroundColor: "#3f3f46",
      color: "#71717a",
      cursor: "not-allowed",
    },
    spinner: {
      width: "16px",
      height: "16px",
      border: "2px solid #000000",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    successBox: {
      marginTop: "16px",
      padding: "12px",
      backgroundColor: "#27272a",
      borderRadius: "6px",
      border: "1px solid #3f3f46",
    },
    successText: {
      fontSize: "14px",
      color: "#d4d4d8",
      marginBottom: "8px",
    },
    link: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      color: "#22c55e",
      textDecoration: "none",
      fontWeight: "500",
    },
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={{ fontSize: "32px" }}>♪</span>
            Spotify Playlist Creator
          </h1>
        </div>

        <div style={styles.statusBar}>
          {!isLoggedIn ? (
            <>
              <span style={styles.statusText}>Not connected</span>
              <button onClick={handleLogin} style={{ ...styles.button, ...styles.loginButton }}>
                → Login con Spotify
              </button>
            </>
          ) : (
            <>
              <span style={styles.connectedText}>Conectad@ a Spotify</span>
              <button onClick={handleLogout} style={{ ...styles.button, ...styles.logoutButton }}>
                ← Logout
              </button>
            </>
          )}
        </div>

        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre de la Playlist</label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder={isLoggedIn ? "Escribí el nombre de la playlist..." : "Logueate para crear playlists"}
              disabled={!isLoggedIn}
              style={{
                ...styles.input,
                ...(isLoggedIn ? {} : styles.inputDisabled),
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Canciones</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isLoggedIn ? "Escribí canciones (uno por linea, separadas con enter. Agregá el autor para mas precisión)..." : "Logueate para agregar canciones"}
              rows={6}
              disabled={!isLoggedIn}
              style={{
                ...styles.textarea,
                ...(isLoggedIn ? {} : styles.inputDisabled),
              }}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!isLoggedIn || !playlistName.trim() || !text.trim() || isCreating}
            style={{
              ...styles.createButton,
              ...(!isLoggedIn || !playlistName.trim() || !text.trim() || isCreating
                ? styles.createButtonDisabled
                : {}),
            }}
          >
            {isCreating ? (
              <>
                <div style={styles.spinner} />
                Creando Playlist...
              </>
            ) : (
              <>♪ Crear Playlist</>
            )}
          </button>

          {result && isLoggedIn && (
            <div style={styles.successBox}>
              <p style={styles.successText}>Playlist creada exitosamente!</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                ↗ Abrir en Spotify
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
