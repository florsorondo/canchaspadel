import { useState } from "react";
import { Tab } from "../components/dashboard/shared.jsx";
import Reservas from "../components/dashboard/Reservas.jsx";
import Canchas from "../components/dashboard/Canchas.jsx";
import Ingresos from "../components/dashboard/Ingresos.jsx";
import MiNegocio from "../components/dashboard/MiNegocio.jsx";


const Dashboard = () => {
  const [tab, setTab] = useState("reservas");

  return (
    <div className="min-h-screen w-full bg-[#f6f5f2] p-6">
      <div className="w-full min-h-[calc(100vh-48px)] bg-white rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-[#2f765b] text-white px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {tab === "reservas" && "Panel de administración"}
            {tab === "canchas" && "Canchas"}
            {tab === "negocio" && "Mi negocio"}
            {tab === "ingresos" && "Ingresos"}
          </h1>

          <span className="bg-white/20 px-4 py-1 rounded-full">
            Dueño
          </span>
        </div>

        <div className="flex gap-10 px-8 py-4 border-b">
          <Tab label="Reservas" active={tab === "reservas"} onClick={() => setTab("reservas")} />
          <Tab label="Canchas" active={tab === "canchas"} onClick={() => setTab("canchas")} />
          <Tab label="Mi negocio" active={tab === "negocio"} onClick={() => setTab("negocio")} />
          <Tab label="Ingresos" active={tab === "ingresos"} onClick={() => setTab("ingresos")} />
        </div>

        {tab === "reservas" && <Reservas />}
        {tab === "canchas" && <Canchas />}
        {tab === "negocio" && <MiNegocio />}
        {tab === "ingresos" && <Ingresos />}
      </div>
    </div>
  );
};


export default Dashboard;