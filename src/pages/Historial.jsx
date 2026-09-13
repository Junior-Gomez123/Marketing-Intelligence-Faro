import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";
import {
  uploadExport,
  getActivity,
  getRecommendations,
  createPostMetric,
  getPostMetrics,
  deletePostMetric,
} from "../services/linkedin.service";
import "./Historial.css";

const TYPE_LABELS = {
  post: "Publicacion",
  comment: "Comentario",
  reaction: "Reaccion",
};

const FILTERS = [
  { value: "", label: "Todo" },
  { value: "post", label: "Publicaciones" },
  { value: "comment", label: "Comentarios" },
  { value: "reaction", label: "Reacciones" },
];

const EMPTY_METRIC_FORM = {
  postSelection: "",
  postLink: "",
  postLabel: "",
  postDate: "",
  impressions: "",
  membersReached: "",
  followerPct: "",
  reactions: "",
  comments: "",
  reposts: "",
};

function StatTile({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function RecommendationCard({ item }) {
  const isStrength = item.status === "strength";
  return (
    <li className={`reco-card ${isStrength ? "strength" : "improvement"}`}>
      <span className="badge">{isStrength ? "Bien" : "Mejorar"}</span>
      <div className="reco-body">
        <div className="reco-title">{item.title}</div>
        <div className="reco-detail">{item.detail}</div>
      </div>
    </li>
  );
}

function formatStat(value, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

export default function Historial() {
  const { currentCustomerId, customers } = useAuth();
  const currentCustomer = customers.find((c) => c._id === currentCustomerId);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [filter, setFilter] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [reco, setReco] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState(null);

  const [postOptions, setPostOptions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [metricForm, setMetricForm] = useState(EMPTY_METRIC_FORM);
  const [savingMetric, setSavingMetric] = useState(false);
  const [metricError, setMetricError] = useState(null);

  const loadActivity = async (type = filter) => {
    if (!currentCustomerId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getActivity(currentCustomerId, { type, limit: 50 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setLoadError(
        err.response?.data?.error || "No se pudo cargar el historial. Verifica que el backend este corriendo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!currentCustomerId) return;
    setRecoLoading(true);
    setRecoError(null);
    try {
      const data = await getRecommendations(currentCustomerId);
      setReco(data);
    } catch (err) {
      setRecoError(err.response?.data?.error || "No se pudieron generar las recomendaciones.");
    } finally {
      setRecoLoading(false);
    }
  };

  const loadPostOptions = async () => {
    if (!currentCustomerId) return;
    try {
      const data = await getActivity(currentCustomerId, { type: "post", limit: 100 });
      setPostOptions(data.items);
    } catch {
      setPostOptions([]);
    }
  };

  const loadMetrics = async () => {
    if (!currentCustomerId) return;
    try {
      const data = await getPostMetrics(currentCustomerId);
      setMetrics(data.items);
    } catch {
      setMetrics([]);
    }
  };

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentCustomerId]);

  useEffect(() => {
    loadRecommendations();
    loadPostOptions();
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCustomerId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !currentCustomerId) return;

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadExport(currentCustomerId, file);
      setUploadResult(result.summary);
      await loadActivity();
      await loadRecommendations();
      await loadPostOptions();
    } catch (err) {
      setUploadError(
        err.response?.data?.error || "No se pudo procesar el archivo. Verifica que sea el ZIP del export de LinkedIn.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleMetricFieldChange = (field) => (e) => {
    const value = e.target.value;
    setMetricForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "postSelection" && value !== "__other__") {
        const selected = postOptions.find((p) => p._id === value);
        if (selected) {
          next.postLabel = selected.text ? selected.text.slice(0, 80) : selected.link;
          next.postDate = selected.occurredAt ? selected.occurredAt.slice(0, 10) : "";
          next.postLink = selected.link || "";
        }
      }
      return next;
    });
  };

  const handleSaveMetric = async (e) => {
    e.preventDefault();
    if (!currentCustomerId) return;
    setSavingMetric(true);
    setMetricError(null);

    try {
      const selectedPost = postOptions.find((p) => p._id === metricForm.postSelection);
      await createPostMetric(currentCustomerId, {
        postLink: selectedPost ? selectedPost.link : metricForm.postLink,
        postLabel: metricForm.postLabel,
        postDate: metricForm.postDate || null,
        impressions: metricForm.impressions,
        membersReached: metricForm.membersReached,
        followerPct: metricForm.followerPct,
        reactions: metricForm.reactions,
        comments: metricForm.comments,
        reposts: metricForm.reposts,
      });
      setMetricForm(EMPTY_METRIC_FORM);
      await loadMetrics();
      await loadRecommendations();
    } catch (err) {
      setMetricError(err.response?.data?.error || "No se pudo guardar la metrica.");
    } finally {
      setSavingMetric(false);
    }
  };

  const handleDeleteMetric = async (id) => {
    if (!currentCustomerId) return;
    await deletePostMetric(currentCustomerId, id);
    await loadMetrics();
    await loadRecommendations();
  };

  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasPostMetrics = reco?.metrics?.postMetricsCount > 0;

  if (!currentCustomerId) {
    return (
      <div className="historial-page">
        <h2>Elegi un cliente</h2>
        <p className="intro-text">
          Todavia no seleccionaste ni creaste ningun cliente. Anda al dashboard para elegir uno o
          crear el primero.
        </p>
        <Link to="/dashboard">Ir al dashboard</Link>
      </div>
    );
  }

  return (
    <div className="historial-page">
      {currentCustomer && (
        <p className="intro-text no-print" style={{ marginTop: 0 }}>
          Reporte de <strong>{currentCustomer.companyName}</strong>
        </p>
      )}

      <h2>Importar tu historial de LinkedIn</h2>
      <p className="intro-text no-print">
        Descarga tu export desde LinkedIn (Configuracion y privacidad → Obtener una copia de tus datos)
        y subi aqui el archivo .zip. Solo incluye tu propia actividad: tus publicaciones, y las
        reacciones/comentarios que vos hiciste en posts de otros. LinkedIn no exporta quien
        reacciono o comento en tus publicaciones.
      </p>

      <form onSubmit={handleUpload} className="upload-form no-print">
        <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? "Procesando..." : "Importar"}
        </button>
      </form>

      {uploadError && <p className="error-text no-print">{uploadError}</p>}

      {uploadResult && (
        <div className="import-summary no-print">
          <strong>Import completado.</strong>
          <div>Archivos detectados en el zip: {uploadResult.filesInZip.join(", ")}</div>
          <div>
            Filas procesadas:{" "}
            {Object.entries(uploadResult.inserted)
              .map(([type, count]) => `${TYPE_LABELS[type] || type}: ${count}`)
              .join(" · ") || "ninguna"}
          </div>
          {uploadResult.skippedFiles.length > 0 && (
            <div>Archivos ignorados (no reconocidos): {uploadResult.skippedFiles.join(", ")}</div>
          )}
        </div>
      )}

      <h2 className="no-print">Alcance y audiencia (carga manual)</h2>
      <p className="intro-text no-print">
        LinkedIn no exporta esto, pero te lo muestra a vos en cada post si tocas <em>"Ver analisis"</em>.
        Carga aca esos numeros una vez por post: impresiones, alcance (miembros unicos) y el % de
        seguidores vs. no seguidores. Con eso el reporte de abajo te dice si tu audiencia crece, y si
        depende de tus seguidores o llega a gente nueva.
      </p>

      <form onSubmit={handleSaveMetric} className="metric-form no-print">
        <div className="metric-form-row">
          <select
            value={metricForm.postSelection}
            onChange={handleMetricFieldChange("postSelection")}
          >
            <option value="">Elegi un post importado (opcional)</option>
            {postOptions.map((p) => (
              <option key={p._id} value={p._id}>
                {(p.occurredAt ? p.occurredAt.slice(0, 10) : "?") + " — " + (p.text ? p.text.slice(0, 60) : p.link)}
              </option>
            ))}
            <option value="__other__">Otro post (no esta en la lista)</option>
          </select>
          <input
            type="text"
            placeholder="Link del post (si no esta en la lista)"
            value={metricForm.postLink}
            onChange={handleMetricFieldChange("postLink")}
          />
          <input
            type="text"
            placeholder="Etiqueta del post"
            value={metricForm.postLabel}
            onChange={handleMetricFieldChange("postLabel")}
          />
          <input type="date" value={metricForm.postDate} onChange={handleMetricFieldChange("postDate")} />
        </div>

        <div className="metric-form-row">
          <label>
            Impresiones
            <input
              type="number"
              min="0"
              value={metricForm.impressions}
              onChange={handleMetricFieldChange("impressions")}
            />
          </label>
          <label>
            Alcance (miembros)
            <input
              type="number"
              min="0"
              value={metricForm.membersReached}
              onChange={handleMetricFieldChange("membersReached")}
            />
          </label>
          <label>
            % seguidores
            <input
              type="number"
              min="0"
              max="100"
              value={metricForm.followerPct}
              onChange={handleMetricFieldChange("followerPct")}
            />
          </label>
        </div>

        <div className="metric-form-row">
          <label>
            Reacciones
            <input type="number" min="0" value={metricForm.reactions} onChange={handleMetricFieldChange("reactions")} />
          </label>
          <label>
            Comentarios
            <input type="number" min="0" value={metricForm.comments} onChange={handleMetricFieldChange("comments")} />
          </label>
          <label>
            Reposts
            <input type="number" min="0" value={metricForm.reposts} onChange={handleMetricFieldChange("reposts")} />
          </label>
          <button type="submit" disabled={savingMetric}>
            {savingMetric ? "Guardando..." : "Guardar metrica"}
          </button>
        </div>
      </form>

      {metricError && <p className="error-text no-print">{metricError}</p>}

      {metrics.length > 0 && (
        <div className="metric-table-wrap no-print">
          <table className="metric-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Post</th>
                <th>Impresiones</th>
                <th>Alcance</th>
                <th>% seguidores</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m._id}>
                  <td>{m.postDate ? new Date(m.postDate).toLocaleDateString() : "—"}</td>
                  <td>{m.postLabel || m.postLink || "—"}</td>
                  <td>{formatStat(m.impressions)}</td>
                  <td>{formatStat(m.membersReached)}</td>
                  <td>{formatStat(m.followerPct, "%")}</td>
                  <td>
                    <button className="link-btn" onClick={() => handleDeleteMetric(m._id)}>
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Todo lo de aca para abajo, dentro de .printable-report, es lo que sale al descargar el PDF */}
      <div className="printable-report">
        <div className="report-header">
          <div className="title-block">
            <BrandMark size={40} />
            <div>
              <h1>
                Reporte de actividad en LinkedIn
                {currentCustomer ? ` para ${currentCustomer.companyName}` : ""}
              </h1>
              <div className="subtitle">Generado el {today}</div>
            </div>
          </div>
          <button className="download-btn no-print" onClick={() => window.print()}>
            ⬇ Descargar reporte (PDF)
          </button>
        </div>

        {recoLoading && <Loader label="Analizando tu actividad..." />}
        {recoError && <p className="error-text">{recoError}</p>}

        {reco && !recoLoading && (
          <>
            <div className="stat-grid">
              <StatTile label="Publicaciones (30 dias)" value={formatStat(reco.metrics.postsLast30d)} />
              <StatTile
                label="Reacciones y comentarios dados (30 dias)"
                value={formatStat(reco.metrics.engagementGivenLast30d)}
              />
              <StatTile label="Dias desde tu ultima publicacion" value={formatStat(reco.metrics.daysSinceLastPost)} />
              <StatTile label="Posts con imagen o video" value={formatStat(reco.metrics.mediaPostsPct, "%")} />
              {hasPostMetrics && (
                <>
                  <StatTile label="Alcance promedio por post" value={formatStat(reco.metrics.avgMembersReached)} />
                  <StatTile label="Impresiones promedio por post" value={formatStat(reco.metrics.avgImpressions)} />
                  <StatTile label="Audiencia que ya te sigue" value={formatStat(reco.metrics.avgFollowerPct, "%")} />
                  <StatTile
                    label="Tasa de interaccion sobre impresiones"
                    value={formatStat(reco.metrics.avgEngagementRate, "%")}
                  />
                </>
              )}
            </div>

            <div className="reco-columns">
              <div className="reco-column">
                <h3>Lo que estas haciendo bien</h3>
                <ul className="reco-list">
                  {reco.strengths.length === 0 && <p>Todavia no hay fortalezas detectadas.</p>}
                  {reco.strengths.map((item, i) => (
                    <RecommendationCard key={`s-${i}`} item={item} />
                  ))}
                </ul>
              </div>
              <div className="reco-column">
                <h3>Lo que podrias mejorar</h3>
                <ul className="reco-list">
                  {reco.improvements.length === 0 && <p>No detectamos mejoras pendientes por ahora.</p>}
                  {reco.improvements.map((item, i) => (
                    <RecommendationCard key={`i-${i}`} item={item} />
                  ))}
                </ul>
              </div>
            </div>

            {!hasPostMetrics && (
              <p className="intro-text no-print">
                Todavia no cargaste alcance/impresiones de ningun post -- hacelo arriba para ver tambien
                si tu audiencia crece y si depende de tus seguidores o llega a gente nueva.
              </p>
            )}

            <p className="disclaimer">{reco.disclaimer}</p>
          </>
        )}
      </div>

      <h2 className="no-print">Timeline</h2>
      <div className="filters-row no-print">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`filter-btn ${filter === f.value ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <Loader label="Cargando historial..." />}
      {loadError && <p className="error-text no-print">{loadError}</p>}

      {!loading && !loadError && (
        <div className="no-print">
          <p>{total} elementos</p>
          <ul className="timeline-list">
            {items.map((item) => (
              <li key={item._id} className="timeline-item">
                <div className="timeline-meta">
                  {TYPE_LABELS[item.type] || item.type}
                  {item.reactionType ? ` · ${item.reactionType}` : ""}
                  {" · "}
                  {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : "fecha desconocida"}
                </div>
                {item.text && <p style={{ margin: "0 0 4px" }}>{item.text}</p>}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer">
                    {item.link}
                  </a>
                )}
              </li>
            ))}
            {items.length === 0 && <p>No hay actividad importada todavia.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}
