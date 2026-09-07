export const inputCls =
  "w-full bg-black/[0.05] border border-black/10 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-600 focus:border-black/40 focus:bg-black/[0.08] focus:outline-none transition-[border-color,background-color] duration-300";

export function Field({ label, error, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={htmlFor} className="block text-xs font-medium tracking-wide text-zinc-600">{label}</label>}
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
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.05] max-w-4xl">{title}</h1>
        {desc && <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">{desc}</p>}
      </div>
    </section>
  );
}

export function CTAButton({ children, variant = "solid", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-7 py-3.5 transition-[background-color,color,border-color,box-shadow,transform] duration-300 active:scale-[0.98]";
  const styles = variant === "solid"
    ? "bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-[0_0_32px_rgba(9,9,11,0.25)]"
    : "border border-black/20 text-zinc-900 hover:border-black/60 hover:bg-black/5";
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
}

export const linkBtnCls = {
  solid: "inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 text-white text-sm font-semibold px-7 py-3.5 hover:bg-zinc-800 hover:shadow-[0_0_32px_rgba(9,9,11,0.25)] transition-[background-color,box-shadow] duration-300",
  ghost: "inline-flex items-center justify-center gap-2 rounded-full border border-black/20 text-zinc-900 text-sm font-semibold px-7 py-3.5 hover:border-black/60 hover:bg-black/5 transition-[border-color,background-color] duration-300",
};
