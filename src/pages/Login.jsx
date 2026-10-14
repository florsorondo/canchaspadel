import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import LOGOAZULPADEL from "../assets/LOGOAZULPADEL.png";
import FOTOFONDO from "../assets/FOTOFONDO.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/panel");
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleAuth = async () => {
    if (!email || !password) return alert("Completá email y contraseña");

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      navigate("/panel");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#F5F1E9] text-[#06122B] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={FOTOFONDO}
          alt="Distrito San Vicente"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#06122B]/70" />
        <div className="absolute inset-0 bg-linear-to-r from-[#06122B]/95 via-[#06122B]/70 to-[#06122B]/35" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-110 bg-[#F5F1E9]/95 backdrop-blur-md border border-[#D6D0C8] rounded-lg p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <img
              src={LOGOAZULPADEL}
              alt="Distrito San Vicente Padel"
              className="w-24 h-24 rounded-full bg-white object-cover mb-5"
            />

            <p className="text-[11px] uppercase tracking-[0.35em] text-[#CD9A50] font-semibold mb-3">
              Distrito San Vicente
            </p>

            <h1 className="text-[36px] md:text-[44px] font-black tracking-tight leading-none">
              Iniciar sesión
            </h1>

            <p className="text-[#6D7580] font-serif italic text-[17px] mt-4">
              Accedé para gestionar tus reservas de pádel.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.22em] font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="tuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-13.5 px-4 bg-white border border-[#D6D0C8] rounded-sm outline-none text-[#06122B] placeholder:text-[#6D7580]/50 focus:border-[#06122B]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.22em] font-bold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-13.5 px-4 bg-white border border-[#D6D0C8] rounded-sm outline-none text-[#06122B] placeholder:text-[#6D7580]/50 focus:border-[#06122B]"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full h-14.5 bg-[#06122B] text-[#F5F1E9] font-extrabold uppercase tracking-[0.22em] text-[13px] rounded-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
