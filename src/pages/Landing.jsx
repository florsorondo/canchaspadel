import {
  Clock,
  MapPin,
  MessageCircle,
  CircleDot,
} from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] p-6 text-[#1f1f1f]">

      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Hero */}
        <section className="grid min-h-107.5 grid-cols-1 items-center gap-8 px-10 py-14 md:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 font-bold text-emerald-900">
              <MapPin size={18} />
              San Vicente, Buenos Aires
            </div>

            <h2 className="max-w-md text-5xl font-extrabold leading-tight md:text-6xl">
              El mejor pádel está acá
            </h2>

            <p className="mt-6 max-w-lg text-2xl font-semibold leading-relaxed text-neutral-500">
              Reservá tu cancha en segundos. Pagá con seña o al contado.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button className="rounded-2xl border border-neutral-100 px-8 py-4 text-xl font-bold text-neutral-100">
                Reservar ahora
              </button>

              <button className="rounded-2xl border border-neutral-100 px-8 py-4 text-xl font-bold text-neutral-100">
                Ver canchas
              </button>
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-emerald-100">
              <div className="h-24 w-24 rounded-full bg-emerald-100" />
            </div>
          </div>
        </section>

        {/* Info cards */}
        <section className="grid grid-cols-1 border-y border-neutral-200 md:grid-cols-3">
          <InfoItem
            icon={<Clock size={24} />}
            title="Horario"
            value="7:00 – 23:00"
          />

          <InfoItem
            icon={<MessageCircle size={24} />}
            title="WhatsApp"
            value="+54 9 2214 ..."
          />

          <InfoItem
            icon={<CircleDot size={24} />}
            title="Canchas"
            value="4 disponibles"
          />
        </section>

        {/* Courts */}
        <section id="canchas" className="px-9 py-9">
          <div className="mb-7 flex items-center justify-between">
            <h3 className="text-3xl font-extrabold">Nuestras canchas</h3>
            <button className="text-xl font-bold text-emerald-600">
              Ver todas
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CourtCard
              imageBg="bg-emerald-100"
              badgeBg="bg-emerald-600"
              title="Cancha 1 — Central"
              description="Techada · Iluminada"
              price="$8.000 / hora"
            />

            <CourtCard
              imageBg="bg-amber-100"
              badgeBg="bg-amber-800"
              title="Cancha 2 — Sur"
              description="Al aire libre"
              price="$6.500 / hora"
            />
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoItem({ icon, title, value }) {
  return (
    <div className="flex items-center gap-5 border-neutral-200 px-8 py-6 md:border-r last:md:border-r-0">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-emerald-600">
        {icon}
      </div>

      <div>
        <p className="text-lg font-bold text-neutral-500">{title}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function CourtCard({ imageBg, badgeBg, title, description, price }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className={`relative h-32 ${imageBg}`}>
        <span
          className={`absolute right-4 top-4 rounded-full px-4 py-1 text-sm font-bold text-white ${badgeBg}`}
        >
          Disponible
        </span>
      </div>

      <div className="p-6">
        <h4 className="text-2xl font-extrabold">{title}</h4>
        <p className="mt-1 text-xl font-semibold text-neutral-500">
          {description}
        </p>
        <p className="mt-4 text-2xl font-extrabold text-emerald-700">
          {price}
        </p>
      </div>
    </article>
  );
}