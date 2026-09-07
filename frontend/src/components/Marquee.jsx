export default function Marquee({ items, light = false }) {
  const row = [...items, ...items];
  return (
    <div data-testid="marquee" className={`overflow-hidden border-y py-5 ${light ? "border-black/10 bg-[#F4F4F5]" : "border-black/10 bg-[#FAFAFA]"}`} aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={`font-display text-sm sm:text-base font-medium tracking-[0.2em] uppercase whitespace-nowrap ${light ? "text-zinc-500" : "text-zinc-500"}`}>
              {item}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${light ? "bg-zinc-400" : "bg-zinc-600"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
