import { useState } from "react";
import { Tab } from "../components/dashboard/shared.jsx";
import Reservas from "../components/dashboard/Reservas.jsx";
import Canchas from "../components/dashboard/Canchas.jsx";
import Ingresos from "../components/dashboard/Ingresos.jsx";
import MiNegocio from "../components/dashboard/MiNegocio.jsx";
import CrearEvento from "../components/dashboard/CrearEventos.jsx";
import Abonos from "../components/dashboard/Abonos.jsx";
const Dashboard = () => {
  const [tab, setTab] = useState("reservas");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f8fbff] to-[#eef5ff] p-6 font-['Inter',sans-serif] overflow-hidden">
      <div className="relative w-full min-h-[calc(100vh-48px)] bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#e3ecf7] shadow-sm">
        <div className="bg-[#315b96] text-white px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {tab === "reservas" && "Panel de administración"}
            {tab === "canchas" && "Canchas"}
            {tab === "negocio" && "Mi negocio"}
            {tab === "ingresos" && "Ingresos"}
            {tab === "crear-evento" && "Crear Evento"}
            {tab === "abonos" && "Abonos"}
          </h1>

          
        </div>

        <div className="flex gap-10 px-8 py-4 border-b overflow-x-auto">
          <Tab
            label="Reservas"
            active={tab === "reservas"}
            onClick={() => setTab("reservas")}
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
            label="Crear Evento"
            active={tab === "crear-evento"}
            onClick={() => setTab("crear-evento")}
          />

          <Tab
            label="Abonos"
            active={tab === "abonos"}
            onClick={() => setTab("abonos")}
          />
        </div>

        {tab === "reservas" && <Reservas />}
        {tab === "canchas" && <Canchas />}
        {tab === "negocio" && <MiNegocio />}
        {tab === "ingresos" && <Ingresos />}
        {tab === "crear-evento" && <CrearEvento />}
        {tab === "abonos" && <Abonos />}
      </div>
    </div>
  );
};

export default Dashboard;