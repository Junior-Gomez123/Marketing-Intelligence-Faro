import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/BrandMark";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "32px",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <BrandMark size={32} />
          <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-h)" }}>Faro</span>
        </div>

        <h1 style={{ margin: 0, fontSize: "20px", color: "var(--text-h)" }}>Iniciar sesion</h1>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--success-solid)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p style={{ fontSize: "14px", textAlign: "center", margin: 0, color: "var(--text)" }}>
          ¿No tenes cuenta? <Link to="/register">Creá una</Link>
        </p>
      </form>
    </div>
  );
}
