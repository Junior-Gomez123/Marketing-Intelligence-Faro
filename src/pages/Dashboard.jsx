import { useEffect, useState } from "react";
import { getLoginUrl } from "../services/linkedin.service";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("profile");

    if (data) {
      setProfile(JSON.parse(data));
    }
  }, []);

  const conectarLinkedin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div style={{ padding: "32px", textAlign: "center" }}>
      <h1>Marketing Intelligence</h1>

      <button
        onClick={conectarLinkedin}
        style={{
          background: "var(--accent-solid)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          fontWeight: 600,
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        Conectar LinkedIn
      </button>

      {profile && (
        <div
          style={{
            marginTop: "28px",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "24px 32px",
            boxShadow: "var(--shadow)",
          }}
        >
          <img
            src={profile.picture}
            width="88"
            height="88"
            style={{ borderRadius: "50%", border: "3px solid var(--success)" }}
            alt={profile.name}
          />
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <p style={{ color: "var(--text)" }}>{profile.email}</p>
        </div>
      )}
    </div>
  );
}
