import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark";

const linkStyle = ({ isActive }) => ({
  padding: "8px 16px",
  borderRadius: "999px",
  textDecoration: "none",
  fontSize: "14px",
  color: isActive ? "#ffffff" : "var(--text)",
  background: isActive ? "var(--accent-solid)" : "transparent",
  fontWeight: isActive ? 600 : 500,
  transition: "background 0.15s, color 0.15s",
});

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 24px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BrandMark size={32} />
        <span style={{ fontWeight: 700, color: "var(--text-h)", fontSize: "15px" }}>
          Faro
        </span>
      </div>

      <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
        <NavLink to="/dashboard" style={linkStyle}>
          Perfil
        </NavLink>
        <NavLink to="/historial" style={linkStyle}>
          Historial
        </NavLink>
      </div>
    </nav>
  );
}
