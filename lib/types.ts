export type Seccion = "portada" | "espacios" | "nosotros" | "departamento";

export interface Foto { id: number; path: string; alt: string; orden: number }

export interface Departamento {
  id: number;
  nombre: string;
  capacidad: number;
  descripcion: string;
  caracteristicas: string[];
  activo: boolean;
  orden: number;
  fotos: Foto[];
}

export interface Atractivo {
  id: number;
  titulo: string;
  texto: string;
  foto: string | null;
  link_url: string | null;
  link_texto: string;
  activo: boolean;
  orden: number;
}

/** Textos editables del sitio (tabla textos_sitio). */
export interface TextosSitio { sanjose_eyebrow: string; sanjose_titulo: string }

export interface DatosSitio {
  departamentos: Departamento[];
  portada: Foto[];
  espacios: Foto[];
  nosotros: Foto[];
  atractivos: Atractivo[];
  textos: TextosSitio;
}

export const SECCIONES_SITIO: { clave: Exclude<Seccion, "departamento">; titulo: string; ayuda: string }[] = [
  { clave: "portada", titulo: "Foto de portada", ayuda: "La primera foto es la imagen grande del inicio. Conviene una horizontal." },
  { clave: "espacios", titulo: "Espacios compartidos", ayuda: "Parrilla, SUM, pileta, jardín… La descripción de cada foto se muestra como título." },
  { clave: "nosotros", titulo: "Sección Nosotros", ayuda: "La primera foto acompaña el texto de bienvenida." },
];
