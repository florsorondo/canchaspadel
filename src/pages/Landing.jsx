import React from "react";
import LOGOAZULPADEL from "../assets/LOGOAZULPADEL.png";
import DIBUJOAZUL from "../assets/DIBUJOAZUL.png";
import FOTOFONDO from "../assets/FOTOFONDO.png";
import fotochicos from "../assets/fotochicos.png";
import cancha1 from "../assets/cancha1.png";
import cancha2 from "../assets/cancha2.png";

const NAV = [
  { href: "#canchas", label: "Canchas" },
  { href: "#nosotros", label: "El Club" },
];

const COURTS = [
  {
    name: "Cancha 1 — Central",
    type: "Techada · Iluminada · WPT",
    price: "$8.000",
    status: "Disponible",
    statusTone: "live",
    image: cancha1,
  },
  {
    name: "Cancha 2 — Sur",
    type: "Al aire libre · Panorámica",
    price: "$6.500",
    status: "Próxima 18:00",
    statusTone: "soon",
    image: cancha2,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F5F1E9] text-[#06122B] font-display">
      <Nav />

      <main>
        <Hero />
        <Courts />
        <About />
      </main>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F5F1E9]/90 backdrop-blur-md border-b border-[#DED8CE]">
      <div className="max-w-[1280px] mx-auto px-10 md:px-12 h-[120px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img
            src={LOGOAZULPADEL}
            alt="Distrito San Vicente Padel"
            className="w-20 h-20 rounded-full bg-white object-cover"
          />

          <div className="flex flex-col">
            <span className="text-[20px] font-black tracking-tight leading-none">
              DISTRITO
            </span>
            <span className="text-[16px] font-mono tracking-[0.30em] font-black uppercase mt-1">
              San Vicente Padel
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-9 text-[16px] font-medium uppercase tracking-wide">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-[#CD9A50]">
              {n.label}
            </a>
          ))}

          <a
            href="#contacto"
            className="px-7 py-3 bg-[#06122B] text-[#F5F1E9] rounded-full hover:opacity-90 transition"
          >
            Reservar
          </a>
        </div>
      </div>
    </nav>
  );
}


function Hero() {
  return (
    <section className="relative pt-14 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
        src={FOTOFONDO}
        alt="Distrito San Vicente"
        className="w-full h-full object-cover"
        />

      <div className="absolute inset-0 bg-[#06122B]/55" />

     <div className="absolute inset-0 bg-gradient-to-r from-[#06122B]/88 via-[#06122B]/55 to-transparent" />
     </div>
      
      <div className="absolute right-[-180px] top-[45%] -translate-y-1/2 hidden lg:block pointer-events-none opacity-[0.12]">
        <img
          src={DIBUJOAZUL}
          alt=""
          className="w-[520px] xl:w-[680px] object-contain"
          
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="max-w-[760px]">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#ECEBE7] border border-[#011142] mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#011142]" />
            <span className="text-[10px] font-mono font-bold text-[#011142] uppercase tracking-[0.25em]">
              San Vicente, Buenos Aires
            </span>
          </div>

          <h1 className="text-[58px] md:text-[86px] font-black tracking-tight leading-[0.92] mb-8 text-white">
            Reservá.{" "}
            <span className="text-white italic font-serif font-normal drop-shadow-[0_0_20px_rgba(61,90,128,0.15)]">
              Jugá.
            </span>
            <br />
            Disfrutá.
          </h1>

          <p className="text-[18px] md:text-[21px] text-white/80 font-serif italic max-w-[680px] mb-10 leading-relaxed">
            Reservá tu cancha en segundos. Pagá con seña o al contado. Canchas
            techadas y al aire libre, abiertas todos los días.
          </p>

          <div className="flex flex-wrap gap-4 items-center mb-14">
            <a
              href="#contacto"
              className="min-w-[220px] h-[58px] px-8 border border-[#D6D0C8] text-[#06122B] font-extrabold uppercase tracking-[0.22em] text-[13px] rounded-[4px] flex items-center justify-center hover:border-[#06122B] transition text-white/80"
            >
              Reservar ahora <span>→</span>
            </a>

            <a
              href="#canchas"
              className="min-w-[220px] h-[58px] px-8 border border-[#D6D0C8] text-[#06122B] font-extrabold uppercase tracking-[0.22em] text-[13px] rounded-[4px] flex items-center justify-center hover:border-[#06122B] transition text-white/80"
            >
              Ver canchas
            </a>
          </div>
        </div>
        

        <InfoBar />
      </div>
    </section>
  );
}

function InfoBar() {
  const items = [
    { n: "01", label: "Horario", value: "07:00 — 23:00 todos los días" },
    { n: "02", label: "Whatsapp", value: "+54 9 2214 55-6677" },
    { n: "03", label: "Canchas", value: "4 disponibles hoy" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border border-[#D6D0C8]">
      {items.map((item) => (
        <div
          key={item.n}
          className="min-h-[105px] px-7 py-6 flex items-center gap-6 border-b md:border-b-0 md:border-r last:border-r-0 border-[#D6D0C8]"
        >
          <span className="text-[#CD9A50] font-mono text-xs">{item.n}/</span>

          <div>
            <p className="text-[12px] uppercase tracking-wider text-white/80 mb-2">
              {item.label}
            </p>
            <p className="text-[17px] font-extrabold text-white/80">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImagePlaceholder({ src, alt, className }) {
  return (
    <div className={`relative overflow-hidden bg-[#D9D4CC] ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#8A847C] uppercase tracking-[0.3em] text-xs">
          Tu imagen
        </div>
      )}
    </div>
  );
}

function Courts() {
  return (
    <section id="canchas" className="py-20 bg-[#06122B]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-14 gap-6 flex-wrap">
          <h2 className="text-[#F5F1E9] text-[42px] md:text-[58px] font-black tracking-tight">
            NUESTRAS CANCHAS
          </h2>

          
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {COURTS.map((c) => (
            <article key={c.name} className="group">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5">
                <ImagePlaceholder
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />

                <span className="absolute top-5 left-5 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#F5F1E9] text-[#06122B] text-[10px] font-mono font-bold uppercase tracking-widest">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      c.statusTone === "live"
                        ? "bg-green-500"
                        : "bg-[#CD9A50]"
                    }`}
                  />
                  {c.status}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4 mt-5">
                <div>
                  <h3 className="text-[#F5F1E9] text-xl font-bold mb-2">
                    {c.name}
                  </h3>
                  <p className="text-[#F5F1E9]/50 text-[11px] uppercase tracking-widest">
                    {c.type}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[#CD9A50] font-mono text-lg">{c.price}</p>
                  <p className="text-[#F5F1E9]/40 text-[10px] uppercase">
                    por hora
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="nosotros" className="py-20 bg-[#F5F1E9]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-14 items-center">
        <ImagePlaceholder
          src={fotochicos}
          alt="Club house de Distrito San Vicente Padel"
          className="w-full aspect-[1/1]"
        />

        <div>
          <h2 className="text-[20px] font-bold font-mono text-[#CD9A50] uppercase tracking-[0.35em] mb-8">
            Nosotros
          </h2>

          <h3 className="text-[38px] md:text-[52px] font-black tracking-tight leading-[1.05] mb-8">
            Donde el deporte se encuentra con el{" "}
            <span className="font-serif italic text-[#CD9A50] font-normal">
              estilo de vida.
            </span>
          </h3>

          <div className="space-y-6 text-[#6D7580] font-serif text-[18px] md:text-[20px] leading-relaxed">
            <p>
              Distrito San Vicente nació de la pasión de tres amigos de toda la vida por el pádel y de una idea simple: crear mucho más que un club. Queríamos construir un espacio donde el juego, la competencia y los buenos momentos se vivan de una manera distinta.
            </p>

            <p>
             Combinamos canchas de primer nivel, un ambiente cálido y una experiencia pensada para disfrutar antes, durante y después de cada partido. Porque para nosotros, el pádel no es solo deporte: es compartir, encontrarse y sentirse parte de un lugar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contacto"
      className="bg-[#06122B] text-[#F5F1E9] py-16 border-t border-[#CD9A50]/20"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <p className="text-xs uppercase tracking-widest text-[#CD9A50] mb-4">
          Contacto
        </p>
        <h3 className="text-3xl font-black mb-5">Reservá tu cancha</h3>
        <p className="text-[#F5F1E9]/60">WhatsApp +54 9 2214 55-6677</p>
      </div>
    </footer>
  );
}