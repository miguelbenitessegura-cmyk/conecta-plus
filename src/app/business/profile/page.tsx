"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LoadState = "loading" | "ready" | "no_business" | "error";

export default function BusinessProfilePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setLoadState("error");
        setErrorMsg("No encontramos tu sesión. Volvé a iniciar sesión.");
        return;
      }

      const uid = sessionData.session.user.id;

      const { data: business, error: businessError } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (businessError) {
        setLoadState("error");
        setErrorMsg("No pudimos cargar tu perfil de comercio.");
        return;
      }

      if (!business) {
        setLoadState("no_business");
        return;
      }

      setBusinessId(business.id);
      setBusinessName(business.business_name || "");
      setDescription(business.description || "");
      setCategory(business.category || "");
      setCity(business.city || "");
      setCountry(business.country || "");
      setWebsite(business.website || "");
      setLoadState("ready");
    };

    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setSaveMessage("");
    setErrorMsg("");

    const { error } = await supabase
      .from("business_profiles")
      .update({
        business_name: businessName,
        description,
        category,
        city,
        country,
        website,
      })
      .eq("id", businessId);

    setSaving(false);

    if (error) {
      setErrorMsg("No pudimos guardar los cambios. Probá de nuevo.");
      return;
    }

    setSaveMessage("Cambios guardados correctamente.");
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
    fontFamily: "sans-serif",
    minHeight: "100vh",
  };

  if (loadState === "loading") {
    return (
      <div style={containerStyle}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#DC2626" }}>{errorMsg}</p>
        <a href="/login" style={{ color: "#4F46E5" }}>
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  if (loadState === "no_business") {
    return (
      <div style={containerStyle}>
        <p>Todavía no tenés un perfil de comercio creado.</p>
        <a href="/onboarding" style={{ color: "#4F46E5" }}>
          Crear perfil de comercio
        </a>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ marginBottom: 24 }}>Perfil de tu comercio</h1>

        <form onSubmit={handleSave}>
          <label style={labelStyle}>Nombre del negocio</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          />

          <label style={labelStyle}>Categoría</label>
          <input
            type="text"
            placeholder="Ej: Ropa, Electrónica, Comida..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Ciudad</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>País</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Sitio web (opcional)</label>
          <input
            type="url"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={inputStyle}
          />

          <button type="submit" disabled={saving} style={submitButtonStyle}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          {saveMessage && (
            <p style={{ color: "#16A34A", marginTop: 12 }}>{saveMessage}</p>
          )}
          {errorMsg && (
            <p style={{ color: "#DC2626", marginTop: 12 }}>{errorMsg}</p>
          )}
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
  marginTop: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 15,
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#4F46E5",
  color: "white",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 24,
};
