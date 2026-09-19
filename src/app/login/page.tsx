"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/onboarding`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (error) {
      setError("No pudimos enviar el link. Probá de nuevo en unos minutos.");
      return;
    }

    setSent(true);
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Conecta+ 🚀</h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Mensajería, compras y negocios en un solo lugar.
      </p>

      {!sent ? (
        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", maxWidth: 340 }}
        >
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
          >
            Ingresá tu correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              marginBottom: 16,
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "#4F46E5",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Enviando..." : "Continuar"}
          </button>
          {error && (
            <p style={{ color: "#DC2626", marginTop: 12 }}>{error}</p>
          )}
        </form>
      ) : (
        <div style={{ maxWidth: 340 }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>📩 ¡Listo!</p>
          <p style={{ color: "#555" }}>
            Te mandamos un link a <strong>{email}</strong>. Abrilo desde tu
            casilla de correo para continuar.
          </p>
        </div>
      )}
    </main>
  );
}
