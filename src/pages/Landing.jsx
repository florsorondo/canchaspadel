import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock, MapPin, MessageCircle, Smartphone, Trophy } from "lucide-react";
import LOGODISTRITO from "../assets/LOGODISTRITO.png";
import FOTOFONDO from "../assets/FOTOFONDO.png";
import fotochicos from "../assets/fotochicos.png";
import cancha1 from "../assets/cancha1.png";
import cancha2 from "../assets/cancha2.png";
import cafeteria from "../assets/cafeteria.png";
import patio from "../assets/patio.png";
import zonasocial from "../assets/zonasocial.png";
import { useCourts } from "../hooks/useCourts";
import { useEvents } from "../hooks/useEvents";
import { useArenaById } from "../hooks/useArenaById";
import { linkWhatsApp } from "../utils/whatsapp";

const DEFAULT_ARENA_ID = import.meta.env.VITE_DEFAULT_ARENA_ID;
const BOOKING_URL = DEFAULT_ARENA_ID ? `/booking/${DEFAULT_ARENA_ID}` : null;

const DIAS_ORDEN = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIAS_NOMBRE = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábado",
  domingo: "domingo",
};

// ["lunes", ..., "sabado"] → "de lunes a sábado"; días salteados → "lunes, miércoles y viernes"
const textoDias = (dias = []) => {
  const indices = DIAS_ORDEN.map((d, i) => (dias.includes(d) ? i : -1)).filter((i) => i >= 0);
  if (indices.length === 0) return "";
  if (indices.length === 7) return "todos los días";

  const seguidos = indices.every((d, i) => i === 0 || d === indices.at(i - 1) + 1);
  const nombres = indices.map((i) => DIAS_NOMBRE[DIAS_ORDEN.at(i)]);

  if (seguidos && nombres.length > 2) return `de ${nombres.at(0)} a ${nombres.at(-1)}`;
  if (nombres.length === 1) return `los ${nombres.at(0).replace(/([^s])$/, "$1s")}`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "2213519098" → "+54 9 221 351-9098"
const formatearTelefono = (telefono) => {
  const d = String(telefono || "").replace(/\D/g, "").replace(/^549?/, "");
  if (d.length !== 10) return String(telefono || "");
  return `+54 9 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
};

// Datos de "Mi negocio" que muestra la landing
const infoDelClub = (arena) => {
  const dias = textoDias(arena?.days_open);
  const apertura = arena?.opening_time;
  const cierre = arena?.closing_time;
  const horas = apertura && cierre ? `${apertura} a ${cierre}` : "";
  const direccion = arena?.address || "";
  const instagram = String(arena?.instagram || "").trim().replace(/^@/, "");

  return {
    dias,
    horas,
    horario: [horas, dias].filter(Boolean).join(" ") || "Consultá por WhatsApp",
    direccion,
    mapsUrl: direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          /san vicente/i.test(direccion) ? direccion : `${direccion}, San Vicente, Buenos Aires`
        )}`
      : null,
    whatsappTexto: formatearTelefono(arena?.phone),
    whatsappUrl: linkWhatsApp(arena?.phone),
    instagram,
    instagramUrl: instagram ? `https://www.instagram.com/${instagram}/` : null,
  };
};

const NAV = [
  { href: "#canchas", label: "Canchas" },
  { href: "#club", label: "El club" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Ubicación" },
];

// Si una cancha no tiene foto cargada, se usa una de estas
const FOTOS_CANCHA = [cancha1, cancha2];

export default function Landing() {
  const { courts, loadingCourts } = useCourts(DEFAULT_ARENA_ID);
  const { events } = useEvents(DEFAULT_ARENA_ID);
  const { arena } = useArenaById(DEFAULT_ARENA_ID);
  const info = infoDelClub(arena);

  const courtsDisponibles = courts.filter((c) => c.available);
  const eventosActivos = (events || []).filter((ev) => ev.status !== "cancelled");

  return (
    <div className="min-h-screen bg-[#F1EDE6] text-[#111318] font-sans">
      <Hero courtsCount={courtsDisponibles.length} info={info} />

      <main>
        <About />
        <Values info={info} />
        <Courts courts={courtsDisponibles} loading={loadingCourts} />
        <Events events={eventosActivos} />
        <Club />
        <Contact info={info} />
      </main>

      <Footer info={info} />
    </div>
  );
}

/* Botón "Reservar": lleva al flujo de reserva, o a contacto si no hay complejo configurado */
function ReservarLink({ className, children }) {
  if (BOOKING_URL) {
    return (
      <Link to={BOOKING_URL} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href="#contacto" className={className}>
      {children}
    </a>
  );
}

function Logo({ className = "" }) {
  return (
    <a href="#" className={`flex items-center gap-3 ${className}`}>
      <img src={LOGODISTRITO} alt="Distrito Padel San Vicente" className="w-14 h-14 object-contain" />
      <span className="flex flex-col leading-none text-white">
        <span className="text-[15px] font-black tracking-[0.08em]">DISTRITO</span>
        <span className="text-[11px] font-bold tracking-[0.3em] mt-1">PADEL</span>
        <span className="text-[9px] font-semibold tracking-[0.25em] mt-1 text-white/70">SAN VICENTE</span>
      </span>
    </a>
  );
}

function Nav() {
  return (
    <nav className="relative z-20 max-w-[1280px] mx-auto px-6 md:px-12 pt-6 flex items-center justify-between gap-6">
      <Logo />

      <div className="hidden md:flex items-center gap-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/85">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="hover:text-[#C9945A] transition">
            {n.label}
          </a>
        ))}
      </div>

      <ReservarLink className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#F1EDE6] text-[#111318] text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-white transition">
        Reservar <ArrowRight size={16} />
      </ReservarLink>
    </nav>
  );
}

function Hero({ courtsCount, info }) {
  return (
    <header className="relative overflow-hidden bg-[#0B1424]">
      <img
        src={FOTOFONDO}
        alt="Canchas y club house de Distrito Padel de noche"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070C17]/90 via-[#070C17]/60 to-[#070C17]/15" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070C17]/70 to-transparent" />

      <Nav />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 pt-14 md:pt-20 pb-12">
        {info.direccion && (
          <a
            href={info.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white text-[11px] font-semibold uppercase tracking-[0.22em] hover:border-white transition"
          >
            <MapPin size={14} /> {info.direccion}
          </a>
        )}

        <h1 className="mt-8 text-white text-[56px] sm:text-[72px] md:text-[96px] leading-[0.92] tracking-[-0.02em]">
          <span className="block font-black">RESERVÁ.</span>
          <span className="block italic font-light">JUGÁ.</span>
          <span className="block font-black">DISFRUTÁ.</span>
        </h1>

        <p className="mt-7 max-w-[520px] text-white/85 text-[17px] md:text-[19px] leading-relaxed">
          Reservá tu cancha en segundos. Pagá con seña o al contado. Canchas techadas y al aire
          libre{info.dias ? `, abiertas ${info.dias}` : ""}.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <ReservarLink className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-[#F1EDE6] text-[#111318] text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-white transition">
            Reservar ahora <ArrowRight size={16} />
          </ReservarLink>
          <a
            href="#canchas"
            className="inline-flex items-center gap-4 px-7 py-4 rounded-full border border-white/70 text-white text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#111318] transition"
          >
            Ver canchas
          </a>
        </div>

        <InfoBar courtsCount={courtsCount} info={info} />
      </div>
    </header>
  );
}

function InfoBar({ courtsCount, info }) {
  const items = [
    { label: "Horario", value: info.horario },
    { label: "WhatsApp", value: info.whatsappTexto || "-", href: info.whatsappUrl },
    {
      label: "Canchas",
      value:
        courtsCount > 0
          ? `${courtsCount} disponible${courtsCount === 1 ? "" : "s"} hoy`
          : "Consultá disponibilidad",
    },
  ];

  return (
    <div className="mt-14 grid grid-cols-1 md:grid-cols-3 rounded-lg border border-white/20 bg-[#070C17]/45 backdrop-blur-md text-white">
      {items.map((item, i) => {
        const contenido = (
          <>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">{item.label}</p>
            <p className="mt-1 text-[16px] font-bold">{item.value}</p>
          </>
        );

        const clases = `px-6 py-5 ${i > 0 ? "border-t md:border-t-0 md:border-l border-white/15" : ""}`;

        return item.href ? (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={`${clases} hover:bg-white/5 transition`}>
            {contenido}
          </a>
        ) : (
          <div key={item.label} className={clases}>
            {contenido}
          </div>
        );
      })}
    </div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] ${
        light ? "text-white/70" : "text-[#8C6A44]"
      }`}
    >
      {children}
      <span className={`h-px w-10 ${light ? "bg-white/50" : "bg-[#8C6A44]"}`} />
    </p>
  );
}

function About() {
  return (
    <section id="nosotros" className="py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <Eyebrow>Nosotros</Eyebrow>

          <h2 className="mt-8 text-[40px] md:text-[54px] font-black leading-[0.98] tracking-[-0.02em] uppercase">
            Donde el deporte se encuentra con el{" "}
            <span className="normal-case italic font-medium text-[#C9945A]">estilo de vida.</span>
          </h2>

          <div className="mt-7 max-w-[480px] space-y-4 text-[#5C5F66] text-[16px] leading-relaxed">
            <p>
              Distrito San Vicente nació de la pasión de tres amigos de toda la vida por el pádel y de
              una idea simple: crear mucho más que un club. Queríamos construir un espacio donde el
              juego, la competencia y los buenos momentos se vivan de una manera distinta.
            </p>
            <p>
              Combinamos canchas de primer nivel, un ambiente cálido y una experiencia pensada para
              disfrutar antes, durante y después de cada partido.
            </p>
          </div>

          <a
            href="#club"
            className="mt-9 inline-flex items-center gap-3 px-7 py-4 rounded-full bg-[#111318] text-white text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#2A2D35] transition"
          >
            Conocé más <ArrowRight size={16} />
          </a>
        </div>

        <div className="overflow-hidden">
          <img
            src={fotochicos}
            alt="Los tres fundadores de Distrito Padel con sus paletas"
            className="w-full aspect-[4/3.6] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Values({ info }) {
  const VALORES = [
    { icon: Trophy, title: "Primer nivel", text: "Canchas profesionales." },
    { icon: Building2, title: "Techadas y al aire libre", text: "Para jugar con cualquier clima." },
    { icon: Smartphone, title: "Reserva online", text: "Pagá con seña o al contado." },
    {
      icon: Clock,
      title: info.dias ? capitalizar(info.dias.replace(/^de /, "")) : "Horarios",
      text: info.horas ? `De ${info.horas}.` : "Consultá por WhatsApp.",
    },
  ];

  return (
    <section className="relative bg-[#121418] text-white overflow-hidden">
      <img
        src={LOGODISTRITO}
        alt=""
        aria-hidden="true"
        className="absolute -right-10 top-1/2 -translate-y-1/2 w-[260px] opacity-[0.06] pointer-events-none hidden md:block"
      />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-y-10">
        {VALORES.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className={`flex flex-col items-center text-center px-4 ${
              i > 0 ? "md:border-l md:border-white/15" : ""
            }`}
          >
            <span className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center">
              <Icon size={24} strokeWidth={1.4} />
            </span>
            <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.2em]">{title}</h3>
            <p className="mt-1 text-[13px] text-white/70 max-w-[180px]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Courts({ courts, loading }) {
  return (
    <section id="canchas" className="py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-6 flex-wrap mb-8">
          <h2 className="flex items-center gap-5 text-[18px] md:text-[20px] font-black uppercase tracking-[0.18em]">
            Nuestras canchas
            <span className="h-px w-12 bg-[#111318]/50" />
          </h2>

          <ReservarLink className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#111318] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#111318] hover:text-white transition">
            Reservar cancha <ArrowRight size={15} />
          </ReservarLink>
        </div>

        {loading ? (
          <p className="text-[#5C5F66]">Cargando canchas...</p>
        ) : courts.length === 0 ? (
          <p className="text-[#5C5F66]">Todavía no hay canchas cargadas.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {courts.map((c, i) => (
              <ReservarLink key={c.id} className="group block rounded-md overflow-hidden bg-[#E2DDD4]">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={c.image_url || FOTOS_CANCHA[i % FOTOS_CANCHA.length]}
                    alt={c.name}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <span>
                    <span className="block text-[13px] font-bold uppercase tracking-[0.2em]">{c.name}</span>
                    <span className="block text-[12px] text-[#5C5F66] mt-0.5">
                      {c.description || "Cancha de pádel"} · ${Number(c.price || 0).toLocaleString("es-AR")} el turno
                    </span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />
                </div>
              </ReservarLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Events({ events }) {
  if (events.length === 0) return null;

  return (
    <section id="eventos" className="pb-16 md:pb-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <h2 className="flex items-center gap-5 text-[18px] md:text-[20px] font-black uppercase tracking-[0.18em] mb-8">
          Eventos
          <span className="h-px w-12 bg-[#111318]/50" />
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/cancha-libre/${ev.id}`}
              className="group flex items-center justify-between gap-4 rounded-md bg-[#121418] text-white px-6 py-5 hover:bg-[#1E2128] transition"
            >
              <span>
                <span className="block text-[15px] font-bold">{ev.title}</span>
                <span className="block text-[13px] text-white/70 mt-1">
                  {ev.date} · {ev.time}
                  {ev.end_time ? ` a ${ev.end_time}` : ""}
                </span>
                <span className="block text-[13px] text-[#C9945A] mt-1">
                  ${Number(ev.price || 0).toLocaleString("es-AR")} por persona
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const ESPACIOS = [
  { label: "Cafetería", src: cafeteria, position: "object-center" },
  { label: "Patio", src: patio, position: "object-[30%_center]" },
  { label: "Zona social", src: zonasocial, position: "object-[70%_center]" },
];

function Club() {
  return (
    <section id="club" className="pb-16 md:pb-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
        <div>
          <span className="block h-px w-10 bg-[#111318]" />
          <h2 className="mt-5 text-[24px] md:text-[28px] font-black uppercase leading-[1.1] tracking-[0.04em]">
            Un club pensado para vos
          </h2>
          <span className="block h-px w-10 bg-[#111318] mt-5" />
          <p className="mt-5 text-[14px] text-[#5C5F66] leading-relaxed max-w-[240px]">
            Más que canchas, un espacio para disfrutar antes, durante y después de cada partido.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ESPACIOS.map((e) => (
            <figure key={e.label} className="m-0">
              <div className="aspect-[4/3.4] overflow-hidden">
                <img src={e.src} alt={e.label} className={`w-full h-full object-cover ${e.position}`} />
              </div>
              <figcaption className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em]">
                {e.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ info }) {
  return (
    <section id="contacto" className="relative overflow-hidden bg-[#0B1424] text-white">
      <img
        src={cancha1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-bottom blur-[3px] scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070C17]/95 via-[#070C17]/75 to-[#070C17]/40" />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div>
          <Eyebrow light>Contacto</Eyebrow>
          <h2 className="mt-5 text-[34px] md:text-[44px] font-black uppercase leading-none tracking-[-0.01em]">
            Reservá tu cancha
          </h2>
          <p className="mt-4 max-w-[420px] text-white/80 text-[16px] leading-relaxed">
            Por WhatsApp u online. Canchas techadas y al aire libre
            {info.dias ? `, abiertas ${info.dias}` : ""}
            {info.horas ? ` de ${info.horas}` : ""}.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {info.whatsappUrl && (
              <a
                href={info.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-white/70 text-[15px] font-semibold hover:bg-white hover:text-[#111318] transition"
              >
                <MessageCircle size={20} /> {info.whatsappTexto}
              </a>
            )}

            {info.direccion && (
              <a
                href={info.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-[15px] font-semibold text-white/85 hover:text-[#C9945A] transition"
              >
                <MapPin size={20} /> {info.direccion}
              </a>
            )}

            {info.instagramUrl && (
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-[15px] font-semibold text-white/85 hover:text-[#C9945A] transition"
              >
                <InstagramIcon size={20} /> @{info.instagram}
              </a>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

function Footer({ info }) {
  return (
    <footer className="bg-[#0E1013] text-white">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-[#C9945A] transition">
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {info.instagramUrl && (
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Distrito Padel"
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:border-[#C9945A] hover:text-[#C9945A] transition"
            >
              <InstagramIcon size={18} />
            </a>
          )}
          {info.whatsappUrl && (
            <a
              href={info.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribinos por WhatsApp"
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:border-[#C9945A] hover:text-[#C9945A] transition"
            >
              <MessageCircle size={18} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

// lucide-react no incluye el logo de Instagram
function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
