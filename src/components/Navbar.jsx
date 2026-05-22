export default Navbar;
const Navbar = () => {
    return (
        <header className="flex items-center justify-between border-b border-neutral-200 px-10 py-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-bold">Arenas San Vicente</h1>
          </div>

          <nav className="hidden items-center gap-10 text-lg font-semibold text-neutral-500 md:flex">
            <a href="#canchas" className="hover:text-neutral-900">
              Canchas
            </a>
            <a href="#horarios" className="hover:text-neutral-900">
              Horarios
            </a>
            <a href="#nosotros" className="hover:text-neutral-900">
              Nosotros
            </a>
          </nav>

          <button className="rounded-2xl border border-neutral-200 px-8 py-4 text-lg font-semibold text-neutral-300">
            Reservar
          </button>
        </header>
    )
}

