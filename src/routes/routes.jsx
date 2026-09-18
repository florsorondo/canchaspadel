import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import BookingSteps from '../pages/BookingSteps';
import BookingConfirmacion from '../pages/BookingConfirmacion';
import EventoCanchaLibre from '../components/dashboard/EventoCanchaLibre.jsx';
import Login from '../pages/Login';

export default function Rutas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/panel" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking/:arenaId" element={<BookingSteps />} />
        <Route path="/booking/:arenaId/confirmacion" element={<BookingConfirmacion />} />
        <Route path="/cancha-libre/:id" element={<EventoCanchaLibre />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
