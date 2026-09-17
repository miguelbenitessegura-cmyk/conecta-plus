import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conecta+",
  description: "Mensajería, compras y negocios en un solo lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
