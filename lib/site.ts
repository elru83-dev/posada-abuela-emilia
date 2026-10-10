function normalizarUrl(v: string | undefined): string {
  const limpio = (v ?? "").trim().replace(/\/+$/, "");
  if (!limpio) return "https://posadaabuelaemilia.com.ar";
  return /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
}

export const SITE_URL = normalizarUrl(process.env.NEXT_PUBLIC_SITE_URL);
// Por defecto, el teléfono del cartel de la posada (011 6822-5708). Se puede cambiar con la variable en Vercel.
export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "5491168225708").replace(/\D/g, "");
export const linkWhatsApp = (mensaje: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

export const POSADA = {
  nombre: "Posada Abuela Emilia",
  isotipo: "/img/isotipo.webp",
  logo: "/img/logo-horizontal.webp",       // 677×201, verde y naranja (fondos claros)
  logoBlanco: "/img/logo-blanco.webp",     // 690×201 (fondos oscuros y fotos)
  homologado: "/img/homologado.webp",
  direccion: "Entre Ríos 1960",
  localidad: "San José, Entre Ríos",
  mapa: "https://maps.app.goo.gl/auk3paFgEtSr6bxt8",
  mapaEmbed: "https://maps.google.com/maps?q=Entre%20Rios%201960%20San%20Jose%20Entre%20Rios&t=m&z=15&output=embed&iwloc=near",
  facebook: "https://www.facebook.com/abuelaemiliasanjose",
  checkin: "12:00",
  checkout: "10:00",
  nochesMinimas: 3,
};

export const DESARROLLADOR = {
  alias: "@RuloOo",
  link: `https://wa.me/5491161339090?text=${encodeURIComponent("Hola RuloOo! Vi el sitio de Posada Abuela Emilia y quiero consultarte por un diseño web.")}`,
};
