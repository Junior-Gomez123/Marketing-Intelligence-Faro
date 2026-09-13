import { NavLink, useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";

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
  const { customers, currentCustomerId, selectCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

      {customers.length > 0 && (
        <select
          value={currentCustomerId}
          onChange={(e) => selectCustomer(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.companyName}
            </option>
          ))}
        </select>
      )}

      <div style={{ display: "flex", gap: "6px", marginLeft: "auto", alignItems: "center" }}>
        <NavLink to="/dashboard" style={linkStyle}>
          Perfil
        </NavLink>
        <NavLink to="/historial" style={linkStyle}>
          Historial
        </NavLink>
        <button
          onClick={handleLogout}
          style={{
            marginLeft: "8px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "8px 16px",
            fontSize: "14px",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Cerrar sesion
        </button>
      </div>
    </nav>
  );
}
