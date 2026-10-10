export default function NoEncontrado() {
  return (
    <main className="seccion contenedor" style={{ textAlign: "center", minHeight: "60vh", display: "grid", placeContent: "center", gap: 20 }}>
      <h1 className="titulo">Esta página no existe</h1>
      <p><a className="btn" href="/">Ir al inicio</a></p>
    </main>
  );
}
