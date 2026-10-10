import type { Metadata, Viewport } from "next";
import "@fontsource/young-serif/400.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/700.css";
import "../globals.css";
import { SITE_URL, POSADA } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Posada Abuela Emilia · Departamentos en San José, Entre Ríos",
  description: "Departamentos totalmente equipados en San José, Entre Ríos, con WiFi, cochera privada y Smart TV. Atendidos por sus dueños. Estadía mínima 3 noches.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_AR", siteName: POSADA.nombre, images: ["/img/portada-frente.webp"], title: "Posada Abuela Emilia · San José, Entre Ríos",
    description: "Departamentos equipados para 3 a 7 personas, con parrilla, SUM y cochera privada." },
};
export const viewport: Viewport = { themeColor: "#00443A" };

export default function SitioRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
