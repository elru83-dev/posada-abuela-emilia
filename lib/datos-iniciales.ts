import type { DatosSitio, Foto } from "./types";

/**
 * Contenido inicial (fotos del sitio anterior, optimizadas en /public/img). Se usa:
 *  - en modo demo (sin Supabase configurado), y
 *  - como fuente de supabase/seed.sql (node --experimental-strip-types scripts/generar-seed.mjs).
 */
let n = 0;
const f = (archivo: string, alt: string): Foto => ({ id: ++n, path: `/img/${archivo}.webp`, alt, orden: n });

const BASE = ["Cocina equipada", "WiFi y Smart TV", "Cochera privada"];
const depto = (id: number, letra: string, capacidad: number, fotos: Foto[]) =>
  ({ id, nombre: `Departamento ${letra}`, capacidad, descripcion: "", caracteristicas: BASE, activo: true, orden: id, fotos });

export const DATOS_INICIALES: DatosSitio = {
  portada: [f("portada-frente", "Frente de la Posada Abuela Emilia")],
  nosotros: [f("susana-y-daniel", "Susana y Daniel, dueños de la posada"), f("susana-y-daniel-homologado", "Susana y Daniel con el certificado de alojamiento homologado")],
  espacios: [
    f("sum", "SUM"),
    f("sum-ping-pong", "SUM con mesa de ping pong"),
    f("sum-metegol", "SUM con metegol"),
    f("quincho", "Quincho"),
    f("patio-hamaca", "Patio con hamaca paraguaya"),
    f("patio-jardin", "Patio"),
    f("jardin", "Jardín"),
    f("camino-entrada", "Camino de entrada"),
    f("cochera", "Cochera"),
    f("cartel-entrada", "Entrada de la posada"),
  ],
  departamentos: [
    depto(1, "A", 7, [f("depto-a-1", "Departamento A"), f("depto-a-2", "Departamento A – cocina y comedor"), f("depto-a-bano", "Departamento A – baño")]),
    depto(2, "B", 6, [f("depto-b-1", "Departamento B"), f("depto-b-2", "Departamento B – cocina"), f("depto-b-bano", "Departamento B – baño")]),
    depto(3, "C", 5, [f("depto-c-1", "Departamento C – cocina y comedor"), f("depto-c-2", "Departamento C – dormitorio"), f("depto-c-bano", "Departamento C – baño")]),
    depto(4, "D", 6, [f("depto-d-1", "Departamento D")]),
    depto(5, "E", 4, [f("depto-e-1", "Departamento E")]),
    depto(6, "F", 3, [f("depto-f-1", "Departamento F"), f("depto-f-bano", "Departamento F – baño")]),
  ],
};
