import { useEffect, useState } from "react";
import { Tab } from "../components/dashboard/shared.jsx";
import Reservas from "../components/dashboard/Reservas.jsx";
import Canchas from "../components/dashboard/Canchas.jsx";
import Ingresos from "../components/dashboard/Ingresos.jsx";
import MiNegocio from "../components/dashboard/MiNegocio.jsx";
import CrearEvento from "../components/dashboard/CrearEventos.jsx";
import Cupones from "../components/dashboard/Cupones.jsx";
import Clientes from "../components/dashboard/Clientes.jsx";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Loader from "../components/Loader.jsx";
import { ArenaProvider } from "../hooks/useArena";

const Dashboard = () => {
  const [tab, setTab] = useState("reservas");
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }

      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loadingAuth) {
    return <Loader />;
  }

  return (
    <ArenaProvider>
      <div className="relative min-h-screen w-full bg-[#F5F1E9] font-sans">
        <div className="w-full min-h-screen xl:p-4 2xl:p-6">
          <div className="w-full min-h-screen xl:min-h-[calc(100vh-48px)] max-w-[1920px] mx-auto bg-white xl:rounded-lg border-0 xl:border border-[#D6D0C8] shadow-sm">
            <div className="bg-[#06122B] text-[#F5F1E9] px-5 sm:px-8 py-5 flex justify-between items-center xl:rounded-t-lg">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#CD9A50] font-semibold mb-1">
                  Distrito San Vicente
                </p>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {tab === "reservas" && "Panel de administración"}
                  {tab === "canchas" && "Canchas"}
                  {tab === "negocio" && "Mi negocio"}
                  {tab === "ingresos" && "Ingresos"}
                  {tab === "crear-evento" && "Cancha libre"}
                  {tab === "cupones" && "Cupones"}
                  {tab === "clientes" && "Clientes"}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold">
                  Dueño
                </span>

                <button
                  onClick={handleLogout}
                  className="border border-white/20 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white/10 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="flex gap-6 sm:gap-9 px-5 sm:px-8 py-4 border-b border-[#D6D0C8] overflow-x-auto">
              <Tab
                label="Reservas"
                active={tab === "reservas"}
                onClick={() => setTab("reservas")}
              />

              <Tab
                label="Clientes"
                active={tab === "clientes"}
                onClick={() => setTab("clientes")}
              />

              <Tab
                label="Canchas"
                active={tab === "canchas"}
                onClick={() => setTab("canchas")}
              />

              <Tab
                label="Mi negocio"
                active={tab === "negocio"}
                onClick={() => setTab("negocio")}
              />

              <Tab
                label="Ingresos"
                active={tab === "ingresos"}
                onClick={() => setTab("ingresos")}
              />

              <Tab
                label="Cancha libre"
                active={tab === "crear-evento"}
                onClick={() => setTab("crear-evento")}
              />

              <Tab
                label="Cupones"
                active={tab === "cupones"}
                onClick={() => setTab("cupones")}
              />
            </div>

            <div className="max-w-[1700px] mx-auto">
              {tab === "reservas" && <Reservas />}
              {tab === "canchas" && <Canchas />}
              {tab === "negocio" && <MiNegocio />}
              {tab === "ingresos" && <Ingresos />}
              {tab === "crear-evento" && <CrearEvento />}
              {tab === "cupones" && <Cupones />}
              {tab === "clientes" && <Clientes />}
            </div>
          </div>
        </div>
      </div>
    </ArenaProvider>
  );
};

export default Dashboard;
