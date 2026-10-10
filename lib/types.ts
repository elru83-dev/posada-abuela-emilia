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

export interface DatosSitio {
  departamentos: Departamento[];
  portada: Foto[];
  espacios: Foto[];
  nosotros: Foto[];
}

export const SECCIONES_SITIO: { clave: Exclude<Seccion, "departamento">; titulo: string; ayuda: string }[] = [
  { clave: "portada", titulo: "Foto de portada", ayuda: "La primera foto es la imagen grande del inicio. Conviene una horizontal." },
  { clave: "espacios", titulo: "Espacios compartidos", ayuda: "Parrilla, SUM, pileta, jardín… La descripción de cada foto se muestra como título." },
  { clave: "nosotros", titulo: "Sección Nosotros", ayuda: "La primera foto acompaña el texto de bienvenida." },
];
