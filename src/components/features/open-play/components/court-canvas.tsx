export const PickleballCourtBox: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const totalLen = 44
  const nvz = 7
  const nvzPct = (nvz / totalLen) * 100
  const midPct = 50
  const upperNVZ = midPct - nvzPct
  const lowerNVZ = midPct + nvzPct

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm bg-[#115e38]">
      <div className="px-3 py-2 border-b border-white/30 text-xs font-semibold text-white/90">
        {label}
      </div>
      <div className="relative">
        <div
          className="relative"
          style={{
            aspectRatio: "11 / 5",
            background: "#137a46",
          }}
        >
          <div className="absolute inset-2 rounded-sm border-2 border-white/70 pointer-events-none" />
          <div
            className="absolute left-2 right-2 bg-white/90"
            style={{ top: `${midPct}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white/12 pointer-events-none"
            style={{ top: `${upperNVZ}%`, height: `${nvzPct * 2}%` }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${upperNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${lowerNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute bg-white/75"
            style={{
              left: "50%",
              width: 2,
              top: "8px",
              bottom: `${100 - upperNVZ}%`,
              transform: "translateX(-1px)",
            }}
          />
          <div
            className="absolute bg-white/75"
            style={{
              left: "50%",
              width: 2,
              top: `${lowerNVZ}%`,
              bottom: "8px",
              transform: "translateX(-1px)",
            }}
          />
        </div>
        <div className="bg-card/90">
          {children}
        </div>
      </div>
    </div>
  )
}

export const CourtCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="rounded-2xl border shadow-sm p-4"
    style={{
      background: `linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04)), #064e3b`,
    }}
  >
    {children}
  </div>
)
