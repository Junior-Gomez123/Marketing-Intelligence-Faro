import { useEffect, useState } from "react";
import Loader from "./Loader";
import {
  getLinkedinStatus,
  getLinkedinConnectUrl,
  disconnectLinkedin,
  getPostSuggestion,
  publishLinkedinPost,
} from "../services/linkedin.service";

// Tarjeta de "que publicar" dentro del reporte: conecta la cuenta de
// LinkedIn del cliente, sugiere un post (idea basada en el mismo motor de
// reglas de Recomendaciones + redaccion con IA) y permite publicarlo.
export default function PostSuggestion({ customerId }) {
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const [suggestion, setSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);
  const [draftText, setDraftText] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const loadStatus = async () => {
    if (!customerId) return;
    setStatusLoading(true);
    try {
      const data = await getLinkedinStatus(customerId);
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setStatusLoading(false);
    }
  };

  const loadSuggestion = async () => {
    if (!customerId) return;
    setSuggestionLoading(true);
    setSuggestionError(null);
    setPublishResult(null);
    setPublishError(null);
    try {
      const data = await getPostSuggestion(customerId);
      setSuggestion(data);
      setDraftText(data.draftText || "");
    } catch (err) {
      setSuggestionError(err.response?.data?.error || "No se pudo generar una sugerencia de post.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    setStatus(null);
    setSuggestion(null);
    setDraftText("");
    setPublishResult(null);
    setPublishError(null);
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    if (status?.connected) {
      loadSuggestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, customerId]);

  // Al volver del OAuth de LinkedIn, el backend redirige a
  // /historial?linkedin=connected (o =error) -- refrescamos el estado y
  // limpiamos el query param para no arrastrarlo en un refresh manual.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinParam = params.get("linkedin");
    if (linkedinParam) {
      loadStatus();
      params.delete("linkedin");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
      if (linkedinParam === "error") {
        setConnectError("No se pudo conectar la cuenta de LinkedIn. Intenta de nuevo.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const { url } = await getLinkedinConnectUrl(customerId);
      window.location.href = url;
    } catch (err) {
      setConnectError(err.response?.data?.error || "No se pudo iniciar la conexion con LinkedIn.");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectLinkedin(customerId);
      setStatus({ connected: false });
      setSuggestion(null);
      setDraftText("");
    } catch {
      // Si falla la desconexion no hay mucho que mostrar; el usuario puede reintentar.
    }
  };

  const handlePublish = async () => {
    if (!draftText.trim()) return;
    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      await publishLinkedinPost(customerId, draftText);
      setPublishResult("Publicado en LinkedIn.");
    } catch (err) {
      setPublishError(
        err.response?.data?.error || "No se pudo publicar. Puede que la conexion haya expirado.",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="linkedin-publish no-print">
      <h2>Sugerencia de proximo post</h2>

      {statusLoading && <Loader label="Revisando conexion con LinkedIn..." />}

      {!statusLoading && !status?.connected && (
        <div className="linkedin-connect-box">
          <p className="intro-text">
            Conecta la cuenta de LinkedIn de este cliente para recibir una sugerencia de que
            publicar (basada en este mismo reporte) y publicarla directo desde aca.
          </p>
          {connectError && <p className="error-text">{connectError}</p>}
          <button className="linkedin-connect-btn" onClick={handleConnect} disabled={connecting}>
            {connecting ? "Conectando..." : "Conectar LinkedIn"}
          </button>
        </div>
      )}

      {!statusLoading && status?.connected && (
        <>
          <div className="linkedin-connected-row">
            {status.picture && <img src={status.picture} alt="" className="linkedin-avatar" />}
            <span>
              Conectado como <strong>{status.name || "cuenta de LinkedIn"}</strong>
            </span>
            <button className="link-btn" onClick={handleDisconnect}>
              Desconectar
            </button>
          </div>

          {status.expired && (
            <p className="error-text">
              La conexion expiro. Desconecta y volve a conectar la cuenta para poder publicar.
            </p>
          )}

          {suggestionLoading && <Loader label="Pensando una sugerencia..." />}
          {suggestionError && <p className="error-text">{suggestionError}</p>}

          {suggestion && !suggestionLoading && (
            <div className="linkedin-suggestion-box">
              <div className="suggestion-angle">
                <strong>Idea:</strong> {suggestion.angle}
              </div>
              <textarea
                className="suggestion-textarea"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={8}
              />
              <div className="suggestion-actions">
                <button className="link-btn" onClick={loadSuggestion} disabled={suggestionLoading}>
                  Generar otra sugerencia
                </button>
                <button
                  className="publish-btn"
                  onClick={handlePublish}
                  disabled={publishing || !draftText.trim() || status.expired}
                >
                  {publishing ? "Publicando..." : "Publicar en LinkedIn"}
                </button>
              </div>
              {publishResult && <p className="success-text">{publishResult}</p>}
              {publishError && <p className="error-text">{publishError}</p>}
              {!suggestion.aiGenerated && (
                <p className="intro-text" style={{ fontSize: "12px" }}>
                  Configura ANTHROPIC_API_KEY en el backend para que esta sugerencia venga redactada
                  por IA (por ahora es solo la idea, sin redaccion).
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
