export const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap font-semibold text-sm hover:cursor-pointer pb-4 -mb-4 transition-all duration-300 uppercase tracking-[0.14em] ${
      active
        ? "text-[#06122B] border-b-2 border-[#CD9A50]"
        : "text-[#6D7580] hover:text-[#06122B] border-b-2 border-transparent"
    }`}
  >
    {label}
  </button>
);

export const Card = ({ title, value, subtitle }) => (
  <div className="bg-white border border-[#D6D0C8] rounded-lg p-5">
    <p className="text-[#6D7580] font-semibold text-xs uppercase tracking-[0.14em]">
      {title}
    </p>

    <h3 className="text-2xl font-black mt-2 text-[#06122B]">{value}</h3>

    <p className="text-[#CD9A50] font-semibold text-sm mt-1">{subtitle}</p>
  </div>
);

export const Input = ({ label, value, onChange, full, type = "text", required }) => (
  <label className={full ? "col-span-2" : ""}>
    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#06122B] mb-2">
      {label}
      {required && <span className="text-[#CD9A50]"> *</span>}
    </p>

    <input
      type={type}
      className="w-full border border-[#D6D0C8] bg-white rounded-sm px-4 py-3 text-[#06122B] outline-none focus:border-[#06122B] transition-all"
      value={value}
      onChange={onChange}
    />
  </label>
);

export const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    className={`bg-[#06122B] text-[#F5F1E9] font-extrabold uppercase tracking-[0.16em] text-[12px] rounded-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, className = "", ...props }) => (
  <button
    className={`border border-[#D6D0C8] bg-white text-[#06122B] font-bold uppercase tracking-[0.14em] text-[12px] rounded-sm px-6 py-3 hover:border-[#06122B] transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Modal = ({ children, onClose, maxWidth = "max-w-md" }) => (
  <div
    className="fixed inset-0 bg-[#06122B]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div
      className={`bg-[#F5F1E9] border border-[#D6D0C8] rounded-lg shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
