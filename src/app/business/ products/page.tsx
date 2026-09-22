"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  price: number;
  stock_status: string;
  is_active: boolean;
};

type LoadState = "loading" | "ready" | "no_business" | "error";

export default function ProductsListPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, stock_status, is_active")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

      if (productsError) {
        setLoadState("error");
        setErrorMsg("No pudimos cargar tus productos.");
        return;
      }

      setProducts(productsData || []);
      setLoadState("ready");
    };

    load();
  }, []);

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
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1>Tus productos</h1>
          <a href="/business/products/new" style={addButtonStyle}>
            + Agregar
          </a>
        </div>

        {products.length === 0 ? (
          <p style={{ color: "#666" }}>
            Todavía no cargaste ningún producto.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map((product) => (
              <div key={product.id} style={productCardStyle}>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{product.name}</p>
                  <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
                    {stockLabel(product.stock_status)}
                    {!product.is_active && " · Pausado"}
                  </p>
                </div>
                <p style={{ fontWeight: 700, margin: 0 }}>
                  ${product.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function stockLabel(status: string) {
  if (status === "available") return "Disponible";
  if (status === "out_of_stock") return "Sin stock";
  return "Stock no informado";
}

const addButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "#4F46E5",
  color: "white",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

const productCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  borderRadius: 10,
  border: "1px solid #e5e5e5",
};
