export const inputCls =
  "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/40 focus:bg-white/[0.06] focus:outline-none transition-[border-color,background-color] duration-300";

export function Field({ label, error, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={htmlFor} className="block text-xs font-medium tracking-wide text-zinc-400">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, desc }) {
  return (
    <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="absolute inset-0 spotlight" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        {eyebrow && <p className="mono-label mb-5">{eyebrow}</p>}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.05] max-w-4xl">{title}</h1>
        {desc && <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">{desc}</p>}
      </div>
    </section>
  );
}

export function CTAButton({ children, variant = "solid", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-7 py-3.5 transition-[background-color,color,border-color,box-shadow,transform] duration-300 active:scale-[0.98]";
  const styles = variant === "solid"
    ? "bg-white text-black hover:bg-zinc-300 hover:shadow-[0_0_32px_rgba(255,255,255,0.22)]"
    : "border border-white/20 text-zinc-100 hover:border-white/60 hover:bg-white/5";
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}

export const linkBtnCls = {
  solid: "inline-flex items-center justify-center gap-2 rounded-full bg-white text-black text-sm font-semibold px-7 py-3.5 hover:bg-zinc-300 hover:shadow-[0_0_32px_rgba(255,255,255,0.22)] transition-[background-color,box-shadow] duration-300",
  ghost: "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-zinc-100 text-sm font-semibold px-7 py-3.5 hover:border-white/60 hover:bg-white/5 transition-[border-color,background-color] duration-300",
};
