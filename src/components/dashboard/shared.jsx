export const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`font-semibold pb-4 -mb-4 transition-all duration-300 ${
      active
        ? "text-[#315b96] border-b-2 border-[#315b96]"
        : "text-[#64748b] hover:text-[#315b96]"
    }`}
  >
    {label}
  </button>
);

export const Card = ({ title, value, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-md border border-[#e3ecf7] rounded-2xl shadow-sm p-5">
    <p className="text-[#64748b] font-semibold text-sm">
      {title}
    </p>

    <h3 className="text-2xl font-bold mt-1 text-[#0f172a]">
      {value}
    </h3>

    <p className="text-[#315b96] font-semibold text-sm mt-1">
      {subtitle}
    </p>
  </div>
);

export const Input = ({ label, value, full }) => (
  <label className={full ? "col-span-2" : ""}>
    <p className="text-[#64748b] font-semibold mb-2">
      {label}
    </p>

    <input
      className="w-full border border-[#d7e3f3] bg-white rounded-xl px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#4f8fe8]/20 focus:border-[#4f8fe8] transition-all"
      defaultValue={value}
    />
  </label>
);