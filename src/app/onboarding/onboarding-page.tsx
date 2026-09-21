"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Step = "loading" | "choose_type" | "personal_form" | "business_form" | "done" | "error";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setStep("error");
        setErrorMsg("No encontramos tu sesión. Volvé a iniciar sesión.");
        return;
      }

      const uid = data.session.user.id;
      setUserId(uid);

      // Verificamos si ya existe la fila en public.users; si no, la creamos
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", uid)
        .maybeSingle();

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({ id: uid });

        if (insertError) {
          setStep("error");
          setErrorMsg("No pudimos crear tu cuenta. Probá de nuevo.");
          return;
        }
      }

      setStep("choose_type");
    };

    init();
  }, []);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const { error } = await supabase
      .from("personal_profiles")
      .insert({ user_id: userId, display_name: displayName });

    if (error) {
      setErrorMsg("No pudimos guardar tu perfil. Probá de nuevo.");
      return;
    }

    setStep("done");
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const { error } = await supabase
      .from("business_profiles")
      .insert({ user_id: userId, business_name: businessName });

    if (error) {
      setErrorMsg("No pudimos guardar tu comercio. Probá de nuevo.");
      return;
    }

    setStep("done");
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 24,
    fontFamily: "sans-serif",
    textAlign: "center",
  };

  if (step === "loading") {
    return (
      <main style={containerStyle}>
        <p>Cargando...</p>
      </main>
    );
  }

  if (step === "error") {
    return (
      <main style={containerStyle}>
        <p style={{ color: "#DC2626" }}>{errorMsg}</p>
        <a href="/login" style={{ marginTop: 16, color: "#4F46E5" }}>
          Volver a iniciar sesión
        </a>
      </main>
    );
  }

  if (step === "choose_type") {
    return (
      <main style={containerStyle}>
        <h1>¿Cómo querés usar la aplicación?</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, width: "100%", maxWidth: 320 }}>
          <button
            onClick={() => setStep("personal_form")}
            style={cardButtonStyle}
          >
            👤 Personal
            <span style={cardSubtextStyle}>
              Para comunicarte, comprar y descubrir productos.
            </span>
          </button>
          <button
            onClick={() => setStep("business_form")}
            style={cardButtonStyle}
          >
            🏪 Comercio
            <span style={cardSubtextStyle}>
              Para vender productos, administrar tu catálogo y contactar clientes.
            </span>
          </button>
        </div>
      </main>
    );
  }

  if (step === "personal_form") {
    return (
      <main style={containerStyle}>
        <h1>Creá tu perfil personal</h1>
        <form onSubmit={handlePersonalSubmit} style={{ width: "100%", maxWidth: 320, marginTop: 16 }}>
          <input
            type="text"
            required
            placeholder="Tu nombre"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={submitButtonStyle}>
            Continuar
          </button>
          {errorMsg && <p style={{ color: "#DC2626", marginTop: 12 }}>{errorMsg}</p>}
        </form>
      </main>
    );
  }

  if (step === "business_form") {
    return (
      <main style={containerStyle}>
        <h1>Creá tu perfil de comercio</h1>
        <form onSubmit={handleBusinessSubmit} style={{ width: "100%", maxWidth: 320, marginTop: 16 }}>
          <input
            type="text"
            required
            placeholder="Nombre de tu negocio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={submitButtonStyle}>
            Continuar
          </button>
          {errorMsg && <p style={{ color: "#DC2626", marginTop: 12 }}>{errorMsg}</p>}
        </form>
      </main>
    );
  }

  // step === "done"
  return (
    <main style={containerStyle}>
      <h1>✅ ¡Listo!</h1>
      <p>Tu cuenta se creó correctamente.</p>
    </main>
  );
}

const cardButtonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 600,
  textAlign: "left",
};

const cardSubtextStyle: React.CSSProperties = {
  fontWeight: 400,
  fontSize: 14,
  color: "#666",
  marginTop: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #ccc",
  marginBottom: 16,
  fontSize: 16,
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
};
