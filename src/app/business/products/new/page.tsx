"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stockStatus, setStockStatus] = useState("available");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
    fontFamily: "sans-serif",
    minHeight: "100vh",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 15,
    marginBottom: 16,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 6,
    display: "block",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Ponele un nombre al producto.");
      return;
    }

    const priceNumber = Number(price);
    if (!price || isNaN(priceNumber) || priceNumber < 0) {
      setErrorMsg("Ingresá un precio válido.");
      return;
    }

    setSaving(true);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setErrorMsg("No encontramos tu sesión. Volvé a iniciar sesión.");
      setSaving(false);
      return;
    }

    const uid = sessionData.session.user.id;

    const { data: business, error: businessError } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();

    if (businessError || !business) {
      setErrorMsg("No encontramos tu perfil de comercio.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("products").insert({
      business_id: business.id,
      name: name.trim(),
      price: priceNumber,
      description: description.trim() || null,
      stock_status: stockStatus,
      is_active: true,
    });

    setSaving(false);

    if (insertError) {
      setErrorMsg("No pudimos guardar el producto. Probá de nuevo.");
      return;
    }

    router.push("/business/products");
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ marginBottom: 24 }}>Agregar producto</h1>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Nombre del producto</label>
          <input
            style={inputStyle}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Zapatillas urbanas"
          />

          <label style={labelStyle}>Precio</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ej: 1500"
          />

          <label style={labelStyle}>Descripción (opcional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá algo más sobre el producto"
          />

          <label style={labelStyle}>Stock</label>
          <select
            style={inputStyle}
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="available">Disponible</option>
            <option value="out_of_stock">Sin stock</option>
            <option value="unknown">No informado</option>
          </select>

          {errorMsg && (
            <p style={{ color: "#DC2626", marginBottom: 16 }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              background: saving ? "#9CA3AF" : "#4F46E5",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      </div>
    </div>
  );
}
