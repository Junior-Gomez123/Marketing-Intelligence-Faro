// Marca propia (no el logo de LinkedIn): un emblema original que combina los
// colores de marca -- azul LinkedIn + verde esmeralda -- para darle identidad
// a Faro sin usar el isotipo real de LinkedIn.
import faroMarca from "../assets/faromarca.svg";

export default function BrandMark({ size = 36 }) {
  return (
    <img
      src={faroMarca}
      width={size}
      height={size}
      alt="Faro"
      style={{ display: "block" }}
    />
  );
}
