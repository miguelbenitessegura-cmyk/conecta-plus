"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ProductDetail = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  stock_status: string;
  is_active: boolean;
  business_id: string;
};

type BusinessInfo = {
  id: string;
  business_name: string;
};

type LoadState = "loading" | "ready" | "not_found" | "error";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!productId) {
        setLoadState("not_found");
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, price, description, stock_status, is_active, business_id")
        .eq("id", productId)
        .maybeSingle();

      if (productError || !productData) {
        setLoadState("not_found");
        return;
      }

      const { data: businessData } = await supabase
        .from("business_profiles")
        .select("id, business_name")
        .eq("id", productData.business_id)
        .maybeSingle();

      setProduct(productData);
      setBusiness(businessData || null);
      setLoadState("ready");
    };

    load();
  }, [productId]);

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

  if (loadState === "not_found" || !product) {
    return (
      <div style={containerStyle}>
        <p>No encontramos este producto.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {business && (
          <p style={{ color: "#4F46E5", fontWeight: 600, marginBottom: 4 }}>
            {business.business_name}
          </p>
        )}

        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{product.name}</h1>

        <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          ${product.price}
        </p>

        <p style={{ color: "#666", marginBottom: 16 }}>
          {stockLabel(product.stock_status)}
          {!product.is_active && " · Pausado"}
        </p>

        {product.description && (
          <p style={{ lineHeight: 1.5 }}>{product.description}</p>
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
