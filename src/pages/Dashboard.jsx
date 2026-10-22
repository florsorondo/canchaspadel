import { useEffect, useState } from "react";
import { Tab, SecondaryButton } from "../components/dashboard/shared.jsx";
import Reservas from "../components/dashboard/Reservas.jsx";
import Canchas from "../components/dashboard/Canchas.jsx";
import Ingresos from "../components/dashboard/Ingresos.jsx";
import MiNegocio from "../components/dashboard/MiNegocio.jsx";
import CrearEvento from "../components/dashboard/CrearEventos.jsx";
import Cupones from "../components/dashboard/Cupones.jsx";
import Clientes from "../components/dashboard/Clientes.jsx";
import Equipo from "../components/dashboard/Equipo.jsx";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Loader from "../components/Loader.jsx";
import { ArenaProvider, useArena } from "../hooks/useArena";
import { useRefunds } from "../hooks/useRefunds";

// ownerOnly: pestañas que un empleado no ve (el backend también lo bloquea)
const TABS = [
  { id: "reservas", label: "Reservas", title: "Panel de administración", Component: Reservas },
  { id: "clientes", label: "Clientes", title: "Clientes", Component: Clientes },
  { id: "canchas", label: "Canchas", title: "Canchas", Component: Canchas },
  { id: "negocio", label: "Mi negocio", title: "Mi negocio", Component: MiNegocio },
  { id: "ingresos", label: "Cobros", title: "Cobros", Component: Ingresos, ownerOnly: true },
  { id: "crear-evento", label: "Eventos", title: "Eventos", Component: CrearEvento },
  { id: "cupones", label: "Cupones", title: "Cupones", Component: Cupones },
  { id: "equipo", label: "Equipo", title: "Equipo", Component: Equipo, ownerOnly: true },
];

const Dashboard = () => {
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
      <DashboardContent onLogout={handleLogout} />
    </ArenaProvider>
  );
};

const DashboardContent = ({ onLogout }) => {
  const { arenaId, isOwner, loadingArena, errorArena } = useArena();
  const [tab, setTab] = useState("reservas");
  // Solo el dueño: muestra cuántas devoluciones hay pendientes en la pestaña Cobros
  const { refunds, fetchRefunds } = useRefunds(arenaId, isOwner);

  const cambiarTab = (id) => {
    setTab(id);
    if (isOwner) fetchRefunds();
  };

  if (loadingArena) {
    return <Loader />;
  }

  if (errorArena) {
    return (
      <div className="min-h-screen bg-[#F5F1E9] flex items-center justify-center p-6">
        <div className="bg-white border border-[#D6D0C8] rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-black text-[#06122B] mb-3">Sin acceso al panel</h1>
          <p className="text-[#6D7580] mb-6">{errorArena}</p>
          <SecondaryButton onClick={onLogout}>Cerrar sesión</SecondaryButton>
        </div>
      </div>
    );
  }

  const tabs = TABS.filter((t) => isOwner || !t.ownerOnly);
  const activeTab = tabs.find((t) => t.id === tab) || tabs[0];
  const ActiveComponent = activeTab.Component;

  return (
    <div className="relative min-h-screen w-full bg-[#F5F1E9] font-sans">
      <div className="w-full min-h-screen xl:p-4 2xl:p-6">
        <div className="w-full min-h-screen xl:min-h-[calc(100vh-48px)] max-w-[1920px] mx-auto bg-white xl:rounded-lg border-0 xl:border border-[#D6D0C8] shadow-sm">
          <div className="bg-[#06122B] text-[#F5F1E9] px-5 sm:px-8 py-5 flex justify-between items-center xl:rounded-t-lg">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#CD9A50] font-semibold mb-1">
                Distrito San Vicente
              </p>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {activeTab.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold">
                {isOwner ? "Dueño" : "Empleado"}
              </span>

              <button
                onClick={onLogout}
                className="border border-white/20 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white/10 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="flex gap-6 sm:gap-9 px-5 sm:px-8 py-4 border-b border-[#D6D0C8] overflow-x-auto">
            {tabs.map((t) => (
              <Tab
                key={t.id}
                label={
                  t.id === "ingresos" && refunds.length > 0
                    ? `${t.label} (${refunds.length} a devolver)`
                    : t.label
                }
                active={activeTab.id === t.id}
                onClick={() => cambiarTab(t.id)}
              />
            ))}
          </div>

          <div className="max-w-[1700px] mx-auto">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
