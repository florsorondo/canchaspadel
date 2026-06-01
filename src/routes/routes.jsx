import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import BookingSteps from "../pages/BookingSteps";
import EventoCanchaLibre from "../components/dashboard/EventoCanchaLibre.jsx";

export default function Rutas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/panel" element={<Dashboard />} />
        <Route path="/booking" element={<BookingSteps />} />
        <Route path="/cancha-libre/:id" element={<EventoCanchaLibre />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}