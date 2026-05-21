import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import BookingSteps from '../pages/bookingsteps';

export default function Rutas() {
  const [loading, setLoader] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/panel" element={<Dashboard />} />
        <Route path="/booking" element={<BookingSteps />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
