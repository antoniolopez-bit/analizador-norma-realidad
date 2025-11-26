"use client";

import { useState } from "react";

export default function HomePage() {
  const [oldConst, setOldConst] = useState(null);
  const [newConst, setNewConst] = useState(null);
  const [laterNorms, setLaterNorms] = useState([]);
  const [statsBefore, setStatsBefore] = useState([]);
  const [statsAfter, setStatsAfter] = useState([]);
  const [intlBefore, setIntlBefore] = useState([]);
  const [intlAfter, setIntlAfter] = useState([]);

  const [instructions, setInstructions] = useState(
    "Genera un informe sintético de 5–8 párrafos, en tono académico, que analice comparativamente: " +
      "(1) la constitución más vieja, (2) la constitución más nueva, (3) las normas posteriores cargadas, " +
      "(4) las estadísticas oficiales antes y después de la nueva constitución, y (5) los informes de organismos internacionales. " +
      "Identifica coherencias, brechas y tensiones entre la prescripción normativa y los resultados empíricos, " +
      "poniendo énfasis en las dimensiones de derechos sociales, derechos civiles y políticos, y derechos económicos/propiedad."
  );
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult("");

    if (!oldConst || !newConst) {
      setError("Tenés que cargar la constitución más vieja y la más nueva.");
      return;
    }
    if (
      laterNorms.length === 0 ||
      statsBefore.length === 0 ||
      statsAfter.length === 0 ||
      intlBefore.length === 0 ||
      intlAfter.length === 0
    ) {
      setError(
        "Tenés que cargar al menos un archivo en cada grupo: normas posteriores, estadísticas antes/después e informes internacionales antes/después."
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("oldConstitution", oldConst);
      formData.append("newConstitution", newConst);

      laterNorms.forEach((file) => formData.append("laterNorms", file));
      statsBefore.forEach((file) => formData.append("statsBefore", file));
      statsAfter.forEach((file) => formData.append("statsAfter", file));
      intlBefore.forEach((file) => formData.append("intlBefore", file));
      intlAfter.forEach((file) => formData.append("intlAfter", file));

      formData.append("instructions", instructions);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error llamando a la API.");
      }

      const data = await res.json();
      setResult(data.result || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const fileInputStyle = {
    display: "block",
    marginTop: "0.25rem",
  };

  const helperStyle = {
    fontSize: "0.85rem",
    color: "#777",
    marginTop: "0.25rem",
  };

  const groupBoxStyle = {
    padding: "0.85rem 1rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#ffffff",
          padding: "1.75rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
          }}
        >
          Norma–Realidad
        </h1>
        <p style={{ marginBottom: "0.25rem", color: "#555", fontWeight: 500 }}>
          Analizador de coherencias, brechas y tensiones entre texto normativo y
          resultados empíricos.
        </p>
        <p style={{ marginBottom: "1.5rem", color: "#555" }}>
          Cargá las constituciones, las normas posteriores, las estadísticas
          oficiales y los informes de organismos internacionales en formato PDF.
          La app generará un informe comparativo usando la API de OpenAI.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          <div style={groupBoxStyle}>
            <label
              htmlFor="oldConst"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              1. Constitución más vieja (PDF)
            </label>
            <input
              id="oldConst"
              type="file"
              accept="application/pdf"
              style={fileInputStyle}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setOldConst(f);
              }}
            />
            <p style={helperStyle}>
              Ejemplo: Constitución de 1976 (o la versión más vieja que quieras
              comparar).
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="newConst"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              2. Constitución más nueva (PDF)
            </label>
            <input
              id="newConst"
              type="file"
              accept="application/pdf"
              style={fileInputStyle}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setNewConst(f);
              }}
            />
            <p style={helperStyle}>
              Ejemplo: Constitución de 2019 (o la reforma más reciente que
              quieras analizar).
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="laterNorms"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              3. Normas posteriores a la nueva constitución (PDF, se pueden
              cargar varias)
            </label>
            <input
              id="laterNorms"
              type="file"
              accept="application/pdf"
              multiple
              style={fileInputStyle}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setLaterNorms(files);
              }}
            />
            <p style={helperStyle}>
              Ejemplo: leyes sectoriales, decretos u otras normas dictadas
              después de la nueva constitución.
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="statsBefore"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              4. Estadísticas oficiales anteriores (PDF, se pueden cargar varias)
            </label>
            <input
              id="statsBefore"
              type="file"
              accept="application/pdf"
              multiple
              style={fileInputStyle}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setStatsBefore(files);
              }}
            />
            <p style={helperStyle}>
              Estadísticas oficiales publicadas antes de la nueva constitución,
              vinculadas a las normas que se quieren analizar.
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="statsAfter"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              5. Estadísticas oficiales posteriores (PDF, se pueden cargar
              varias)
            </label>
            <input
              id="statsAfter"
              type="file"
              accept="application/pdf"
              multiple
              style={fileInputStyle}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setStatsAfter(files);
              }}
            />
            <p style={helperStyle}>
              Estadísticas oficiales publicadas después de la nueva
              constitución, vinculadas a las mismas políticas o sectores.
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="intlBefore"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              6. Informes de organismos internacionales anteriores (PDF, se
              pueden cargar varias)
            </label>
            <input
              id="intlBefore"
              type="file"
              accept="application/pdf"
              multiple
              style={fileInputStyle}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setIntlBefore(files);
              }}
            />
            <p style={helperStyle}>
              Informes de organismos internacionales previos a la nueva
              constitución, que permitan contrastar con las estadísticas
              oficiales anteriores.
            </p>
          </div>

          <div style={groupBoxStyle}>
            <label
              htmlFor="intlAfter"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              7. Informes de organismos internacionales posteriores (PDF, se
              pueden cargar varias)
            </label>
            <input
              id="intlAfter"
              type="file"
              accept="application/pdf"
              multiple
              style={fileInputStyle}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setIntlAfter(files);
              }}
            />
            <p style={helperStyle}>
              Informes posteriores a la nueva constitución, para contrastar con
              las estadísticas oficiales posteriores.
            </p>
          </div>

          <div>
            <label
              htmlFor="instructions"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Consigna para el modelo (opcional)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                resize: "vertical",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid " + "#d0d4dd",
                fontFamily: "inherit",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "#ffffff",
              padding: "0.75rem 1.25rem",
              borderRadius: "999px",
              border: "none",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              justifySelf: "flex-start",
            }}
          >
            {loading ? "Analizando..." : "Analizar documentos"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <section
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              Resultado
            </h2>
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                color: "#111827",
              }}
            >
              {result}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
