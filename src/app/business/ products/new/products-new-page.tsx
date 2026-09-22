"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LoadState = "loading" | "ready" | "no_business" | "error";

export default function NewProductPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("not_informed");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (businessError || !business) {
        setLoadState("no_business");
        return;
      }

      setBusinessId(business.id);
      setLoadState("ready");
    };

    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setErrorMsg("");
    setSaved(false);

    const { error } = await supabase.from("products").insert({
      business_id: businessId,
      name,
      price: parseFloat(price),
      description,
      category,
      stock_status: stockStatus,
    });

    setSaving(false);

    if (error) {
      setErrorMsg("No pudimos guardar el producto. Probá de nuevo.");
      return;
    }

    setSaved(true);
    setName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setStockStatus("not_informed");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1>Nuevo producto</h1>
          <a href="/business/products" style={{ color: "#4F46E5" }}>
            Ver productos
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Nombre del producto</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Precio</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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

          <label style={labelStyle}>Disponibilidad</label>
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="not_informed">Stock no informado</option>
            <option value="available">Disponible</option>
            <option value="out_of_stock">Sin stock</option>
          </select>

          <button type="submit" disabled={saving} style={submitButtonStyle}>
            {saving ? "Guardando..." : "Guardar producto"}
          </button>

          {saved && (
            <p style={{ color: "#16A34A", marginTop: 12 }}>
              Producto guardado correctamente.
            </p>
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
