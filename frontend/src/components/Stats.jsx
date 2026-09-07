import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 tabular-nums">
      {Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}{suffix}
    </span>
  );
}

export default function Stats({ items }) {
  return (
    <div data-testid="stats-section" className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
      {items.map((s) => (
        <div key={s.label} className="bg-[#0A0A0C] p-8 sm:p-10">
          <Counter value={s.value} suffix={s.suffix} />
          <p className="mono-label mt-3">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
