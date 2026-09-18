const Loader = () => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-8 w-56 bg-[#EFEAE0] rounded-sm animate-pulse" />
      </div>

      <div className="w-full border border-[#D6D0C8] rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-8 gap-4 px-6 py-4 border-b border-[#D6D0C8]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-[#EFEAE0] rounded-sm animate-pulse"
            />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-8 gap-4 px-6 py-5 border-b border-[#EFEAE0] last:border-b-0"
          >
            {Array.from({ length: 8 }).map((_, col) => (
              <div
                key={col}
                className={`h-5 rounded-sm bg-[#F5F1E9] animate-pulse ${
                  col === 1 ? "w-28" : col === 6 ? "w-20 rounded-full" : "w-full"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
