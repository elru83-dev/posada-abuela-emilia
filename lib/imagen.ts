"use client";

/**
 * Achica y convierte la foto en el navegador antes de subirla:
 * una foto de celular de 5 MB queda en ~200 KB WebP de 1600 px.
 * Ahorra Storage, transferencia y hace que el sitio cargue rápido.
 */
export async function comprimirImagen(file: File, max = 1600, calidad = 0.82): Promise<{ blob: Blob; ext: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * escala);
  const h = Math.round(bmp.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const aBlob = (tipo: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, tipo, calidad));
  const webp = await aBlob("image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  // Navegadores viejos sin WebP: JPEG.
  const jpg = await aBlob("image/jpeg");
  if (!jpg) throw new Error("No se pudo procesar la imagen");
  return { blob: jpg, ext: "jpg" };
}
