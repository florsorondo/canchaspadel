export const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`font-semibold pb-4 -mb-4 transition ${
      active
        ? "text-[#2f765b] border-b-2 border-[#2f765b]"
        : "text-gray-500 hover:text-black"
    }`}
  >
    {label}
  </button>
);

export const Card = ({ title, value, subtitle }) => (
  <div className="bg-[#f4f3f1] rounded-xl p-5">
    <p className="text-gray-400 font-semibold text-sm">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
    <p className="text-[#3ca978] font-semibold text-sm mt-1">{subtitle}</p>
  </div>
);

export const Input = ({ label, value, full }) => (
  <label className={full ? "col-span-2" : ""}>
    <p className="text-gray-500 font-semibold mb-2">{label}</p>
    <input
      className="w-full border border-gray-300 rounded-xl px-4 py-3"
      defaultValue={value}
    />
  </label>
);