import type { Metadata } from "next";
import "@fontsource/young-serif/400.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/700.css";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = { title: "Panel | Posada Abuela Emilia", robots: { index: false, follow: false } };

// Layout raíz propio del panel (el sitio público tiene el suyo en app/(sitio)).
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
