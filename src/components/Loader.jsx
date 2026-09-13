export default function Loader({ label = "Cargando..." }) {
  return (
    <div style={{ padding: "24px", color: "var(--text)" }}>
      {label}
    </div>
  );
}
