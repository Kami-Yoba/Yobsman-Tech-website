import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, className = "", y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLines({ lines, className = "", lineClassName = "" }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
            className={`block ${lineClassName}`}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function SectionHead({ eyebrow, title, desc, align = "start", light = false }) {
  return (
    <Reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} mb-14 sm:mb-20`}>
      {eyebrow && <p className="mono-label mb-4">{eyebrow}</p>}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.08] ${light ? "text-zinc-950" : "text-zinc-50"}`}>{title}</h2>
      {desc && <p className={`mt-5 text-base sm:text-lg leading-relaxed ${light ? "text-zinc-600" : "text-zinc-400"}`}>{desc}</p>}
    </Reveal>
  );
}
