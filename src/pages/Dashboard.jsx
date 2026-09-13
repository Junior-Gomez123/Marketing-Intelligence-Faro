import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, customers, currentCustomerId, loadingCustomers, createCustomer, selectCustomer } =
    useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      await createCustomer({ companyName, contactEmail });
      setCompanyName("");
      setContactEmail("");
    } catch (err) {
      setCreateError(err.response?.data?.error || "No se pudo crear el cliente.");
    } finally {
      setCreating(false);
    }
  };

  const goToReport = (id) => {
    selectCustomer(id);
    navigate("/historial");
  };

  return (
    <div style={{ padding: "32px", maxWidth: "720px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--text-h)" }}>Hola{user?.name ? `, ${user.name}` : ""}</h1>
      <p style={{ color: "var(--text)" }}>
        Elegi un cliente para ver su reporte, o creá uno nuevo.
      </p>

      {loadingCustomers && <p>Cargando clientes...</p>}

      {!loadingCustomers && customers.length === 0 && (
        <p style={{ color: "var(--text)" }}>Todavia no creaste ningun cliente.</p>
      )}

      {customers.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: "16px 0",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {customers.map((c) => (
            <li
              key={c._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "14px 18px",
                background: c._id === currentCustomerId ? "var(--accent-soft, rgba(10,102,194,0.08))" : "transparent",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{c.companyName}</div>
                {c.contactEmail && (
                  <div style={{ fontSize: "13px", color: "var(--text)" }}>{c.contactEmail}</div>
                )}
              </div>
              <button
                onClick={() => goToReport(c._id)}
                style={{
                  background: "var(--accent-solid)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ver reporte
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleCreate}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "18px",
          marginTop: "24px",
        }}
      >
        <strong style={{ color: "var(--text-h)" }}>Nuevo cliente</strong>
        <input
          type="text"
          placeholder="Nombre del cliente / empresa"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email de contacto (opcional)"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        {createError && <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>{createError}</p>}
        <button
          type="submit"
          disabled={creating}
          style={{
            background: "var(--success-solid)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          {creating ? "Creando..." : "Crear cliente"}
        </button>
      </form>
    </div>
  );
}
