import Image from "next/image";
import { getDatosSitio } from "@/lib/data";
import { urlImagen } from "@/lib/urls";
import { POSADA, WHATSAPP, linkWhatsApp, DESARROLLADOR, SITE_URL } from "@/lib/site";
import { Header } from "@/components/Header";
import { Visor, type FotoVisor } from "@/components/Visor";
import { FormReserva, IconoWa } from "@/components/FormReserva";
import type { Foto } from "@/lib/types";

// Página estática: se regenera al guardar en el panel (revalidatePath) y, como red de seguridad, cada hora.
export const revalidate = 3600;

const aVisor = (fotos: Foto[]): FotoVisor[] => fotos.map((f) => ({ src: urlImagen(f.path), alt: f.alt }));

const MOTIVOS = [
  { titulo: "Termas de San José", foto: "/img/termas-san-jose.webp", alt: "Ingreso a las Termas de San José",
    texto: "Piletas termales para relajarse todo el año, a pocos minutos de la posada." },
  { titulo: "Molino Forclaz", foto: "/img/molino-forclaz.webp", alt: "Museo Molino Forclaz",
    texto: "El histórico molino de viento de los colonos, hoy museo, símbolo de la colonia fundada por inmigrantes europeos." },
  { titulo: "Paseo del Mate", foto: "/img/paseo-del-mate.webp", alt: "Cartel del Paseo del Mate",
    texto: "Un recorrido dedicado a la tradición del mate, para conocer la cultura de la región." },
];

const SERVICIOS: [string, React.ReactNode][] = [
  ["WiFi", <path key="w" d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01" />],
  ["Cochera privada", <path key="c" d="M3 11l9-7 9 7v9H3zM7 20v-6h10v6M7 17h10" />],
  ["Smart TV", <path key="t" d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 4zM8 21h8M12 17v4" />],
  ["Cocina equipada", <path key="k" d="M4 10h16v3a8 8 0 0 1-16 0zM9 4c-1 1.5 1 2.5 0 4M13 3c-1 1.5 1 2.5 0 4" />],
  ["Parrilla", <path key="p" d="M3 12h18M6 12V8a3 3 0 0 1 6 0M5 12l2 8M19 12l-2 8M12 12v8" />],
  ["Ping pong y SUM", <path key="s" d="M8 4a5 5 0 1 1 0 10A5 5 0 0 1 8 4zM11.5 12.5L19 20M16 6.5l3-3" />],
];

export default async function Inicio() {
  const { departamentos, portada, espacios, nosotros } = await getDatosSitio();
  const hero = portada[0];
  const fotoNos = nosotros[0];

  const galerias: Record<string, FotoVisor[]> = { espacios: aVisor(espacios) };
  const titulos: Record<string, string> = { espacios: "Espacios compartidos" };
  for (const d of departamentos) { galerias[`depto-${d.id}`] = aVisor(d.fotos); titulos[`depto-${d.id}`] = d.nombre; }

  const capacidades = departamentos.map((d) => d.capacidad);
  const rango = capacidades.length ? `${Math.min(...capacidades)} a ${Math.max(...capacidades)} personas` : "";
  const waGeneral = linkWhatsApp("Hola! Quiero consultar por la Posada Abuela Emilia.");

  const jsonLd = {
    "@context": "https://schema.org", "@type": "LodgingBusiness", name: POSADA.nombre, url: SITE_URL,
    image: hero ? new URL(urlImagen(hero.path), SITE_URL).href : undefined,
    address: { "@type": "PostalAddress", streetAddress: POSADA.direccion, addressLocality: "San José", addressRegion: "Entre Ríos", addressCountry: "AR" },
    checkinTime: POSADA.checkin, checkoutTime: POSADA.checkout, sameAs: [POSADA.facebook],
  };

  return (
    <Visor galerias={galerias} titulos={titulos}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a className="saltar" href="#contenido">Ir al contenido</a>
      <Header logo={POSADA.logo} />

      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="t-hero">
          {hero && <Image className="hero__img" src={urlImagen(hero.path)} alt={hero.alt} fill priority sizes="100vw" />}
          <div className="hero__velo" />
          <div className="contenedor hero__contenido">
            <p className="hero__lugar">San José · Entre Ríos</p>
            <h1 id="t-hero" className="hero__logo">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo vectorial liviano (7 KB) */}
              <img src={POSADA.logoBlanco} alt="Posada Abuela Emilia" width={690} height={201} />
            </h1>
            <p className="hero__bajada">Departamentos totalmente equipados para descansar como en casa, atendidos por sus dueños.</p>
            <div className="hero__ctas">
              <a href="#departamentos" className="btn btn--claro">Ver departamentos</a>
              <a href="#reservar" className="btn btn--fantasma">Reservar</a>
            </div>
          </div>
        </section>

        <section className="datos" aria-label="Datos de la estadía">
          <div className="contenedor datos__grilla">
            <div><span>Check-in</span><b>{POSADA.checkin} hs</b></div>
            <div><span>Check-out</span><b>{POSADA.checkout} hs</b></div>
            <div><span>Estadía mínima</span><b>{POSADA.nochesMinimas} noches</b></div>
            <div><span>Mascotas</span><b>Consultar</b></div>
          </div>
        </section>

        <section className="seccion contenedor" id="departamentos" aria-labelledby="t-deptos">
          <div className="intro">
            <div>
              <p className="eyebrow">Nuestros departamentos</p>
              <h2 id="t-deptos" className="titulo">{departamentos.length} departamentos{rango && `, para ${rango}`}</h2>
              <p className="texto">Cada departamento está totalmente equipado para que solo tengas que llegar y disfrutar. Ideales para familias y grupos de amigos que buscan tranquilidad, cerca de las termas, de Colón y del río Uruguay.</p>
            </div>
            <ul className="servicios">
              {SERVICIOS.map(([t, icono]) => (
                <li key={t}><svg aria-hidden="true" viewBox="0 0 24 24">{icono}</svg>{t}</li>
              ))}
            </ul>
          </div>

          <div className="deptos">
            {departamentos.map((d) => {
              const portadaD = d.fotos[0];
              return (
                <article className="depto" key={d.id}>
                  {portadaD ? (
                    <button type="button" className="depto__foto" data-galeria={`depto-${d.id}`} aria-label={`Ver fotos del ${d.nombre}`}>
                      <Image src={urlImagen(portadaD.path)} alt={portadaD.alt || d.nombre} fill sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 380px" />
                      {d.fotos.length > 1 && <span className="depto__nfotos">{d.fotos.length} fotos</span>}
                    </button>
                  ) : <div className="depto__foto depto__foto--vacia">Fotos próximamente</div>}
                  <div className="depto__cuerpo">
                    <h3>{d.nombre}</h3>
                    <p className="depto__cap">Hasta {d.capacidad} personas</p>
                    {d.descripcion && <p className="depto__desc">{d.descripcion}</p>}
                    {d.caracteristicas.length > 0 && <ul className="depto__lista">{d.caracteristicas.map((c) => <li key={c}>{c}</li>)}</ul>}
                    <a href="#reservar" className="btn btn--borde" data-consultar={d.id}>Consultar</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {espacios.length > 0 && (
          <section className="seccion seccion--tono" id="espacios" aria-labelledby="t-esp">
            <div className="contenedor">
              <p className="eyebrow">Espacios compartidos</p>
              <h2 id="t-esp" className="titulo">Para disfrutar al aire libre</h2>
              <div className="mosaico">
                {espacios.map((f, i) => (
                  <button type="button" className="mosaico__item" key={f.id} data-galeria="espacios" data-i={i} aria-label={`Ampliar: ${f.alt}`}>
                    <Image src={urlImagen(f.path)} alt={f.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 380px" />
                    {f.alt && <span>{f.alt}</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="seccion contenedor nosotros" id="nosotros" aria-labelledby="t-nos">
          {fotoNos && (
            <figure className="nosotros__foto">
              <Image src={urlImagen(fotoNos.path)} alt={fotoNos.alt} fill sizes="(max-width: 860px) 100vw, 560px" />
            </figure>
          )}
          <div>
            <p className="eyebrow">Sobre nosotros</p>
            <h2 id="t-nos" className="titulo">Bienvenidos a nuestra casa</h2>
            <p className="texto">Somos un matrimonio de docentes jubilados. Atendemos personalmente la posada y, como nos encanta viajar, ofrecemos lo que a nosotros nos gusta encontrar en nuestras vacaciones.</p>
            <p className="texto">Queremos brindarte un servicio de calidad para que te sientas como en tu casa. Te invitamos a disfrutar de una estadía con nosotros.</p>
            <p className="firma">Susana y Daniel</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="homologado" src={POSADA.homologado} alt="Alojamiento homologado por el Municipio de San José, Entre Ríos" width={459} height={201} loading="lazy" />
            <a href="#reservar" className="btn">Contactanos</a>
          </div>
        </section>

        <section className="seccion seccion--oscura" aria-labelledby="t-por">
          <div className="contenedor">
            <p className="eyebrow">¿Por qué San José?</p>
            <h2 id="t-por" className="titulo">Termas, historia y tradición</h2>
            <div className="motivos">
              {MOTIVOS.map((m) => (
                <article className="motivo" key={m.titulo}>
                  <div className="motivo__foto"><Image src={m.foto} alt={m.alt} fill sizes="(max-width: 860px) 100vw, 360px" /></div>
                  <div className="motivo__cuerpo">
                    <h3>{m.titulo}</h3>
                    <p>{m.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="seccion contenedor ubicacion" id="ubicacion" aria-labelledby="t-ubi">
          <div>
            <p className="eyebrow">Ubicación</p>
            <h2 id="t-ubi" className="titulo">Encontranos en San José</h2>
            <p className="direccion">{POSADA.direccion}<br />{POSADA.localidad}</p>
            <a className="btn btn--borde" href={POSADA.mapa} target="_blank" rel="noopener">Cómo llegar</a>
          </div>
          <div className="mapa">
            <iframe title={`Mapa: ${POSADA.direccion}, ${POSADA.localidad}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={POSADA.mapaEmbed} />
          </div>
        </section>

        <section className="seccion seccion--tono" id="reservar" aria-labelledby="t-res">
          <div className="contenedor reservar">
            <div>
              <p className="eyebrow">Reservas</p>
              <h2 id="t-res" className="titulo">Reservá tu estadía</h2>
              <p className="texto">Completá los datos y te respondemos por WhatsApp con la disponibilidad y la tarifa.</p>
              <div className="reservar__foto"><Image src="/img/mate.webp" alt="Mate con pava y bombilla" fill sizes="(max-width: 860px) 100vw, 460px" /></div>
              <ul className="condiciones">
                <li>Check-in {POSADA.checkin} hs · Check-out {POSADA.checkout} hs</li>
                <li>Estadía mínima de {POSADA.nochesMinimas} noches</li>
                <li>Mascotas: consultar</li>
              </ul>
            </div>
            <FormReserva deptos={departamentos.map(({ id, nombre, capacidad }) => ({ id, nombre, capacidad }))} whatsapp={WHATSAPP} nochesMinimas={POSADA.nochesMinimas} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="contenedor footer__grilla">
          <div className="footer__marca">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSADA.logoBlanco} alt={POSADA.nombre} width={690} height={201} loading="lazy" className="footer__logo" />
            <p>Departamentos equipados en San José, Entre Ríos.</p>
          </div>
          <div>
            <h2 className="footer__titulo">Contacto</h2>
            <ul>
              <li><a href={POSADA.mapa} target="_blank" rel="noopener">{POSADA.direccion}, San José</a></li>
              <li><a href={waGeneral} target="_blank" rel="noopener">WhatsApp</a></li>
              <li><a href={POSADA.facebook} target="_blank" rel="noopener">Facebook</a></li>
            </ul>
          </div>
          <div>
            <h2 className="footer__titulo">Estadía</h2>
            <ul>
              <li>Check-in {POSADA.checkin} hs</li><li>Check-out {POSADA.checkout} hs</li><li>Mínimo {POSADA.nochesMinimas} noches</li>
            </ul>
          </div>
        </div>
        <div className="contenedor footer__legal">
          <span>© {new Date().getFullYear()} {POSADA.nombre}</span>
          <a className="footer__credito" href={DESARROLLADOR.link} target="_blank" rel="noopener" aria-label={`Powered by ${DESARROLLADOR.alias}, escribir por WhatsApp`}>
            Powered by <b>{DESARROLLADOR.alias}</b>
          </a>
        </div>
      </footer>

      <a className="wa-flotante" href={waGeneral} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp"><IconoWa size={30} /></a>
    </Visor>
  );
}
