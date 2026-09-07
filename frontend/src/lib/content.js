import {
  Headphones, TrendingUp, Code2, Monitor, Brain, Smartphone, BadgeCheck, Globe, Wrench, Plane,
} from "lucide-react";

export const ICONS = {
  Headset: Headphones, ChartLineUp: TrendingUp, Code: Code2, Desktop: Monitor,
  Brain, DeviceMobile: Smartphone, SealCheck: BadgeCheck, GlobeHemisphereWest: Globe, Plane,
};
export const iconFor = (name) => ICONS[name] || Wrench;

export const HUBS = [
  { city: "Espoo / Helsinki", country: "Finland", role: "Global HQ & R&D", coords: "60.17° N, 24.94° E" },
  { city: "Frankfurt", country: "Germany", role: "EU Delivery Hub", coords: "50.11° N, 8.68° E" },
  { city: "Dubai", country: "UAE", role: "MENA Technology Center", coords: "25.20° N, 55.27° E" },
  { city: "Nairobi", country: "Kenya", role: "Africa Operations", coords: "1.29° S, 36.82° E" },
  { city: "Singapore", country: "Singapore", role: "APAC Innovation", coords: "1.35° N, 103.82° E" },
  { city: "London", country: "United Kingdom", role: "Commercial Division", coords: "51.50° N, 0.12° W" },
];

export const WHY = [
  { n: "01", title: "Finnish engineering discipline", desc: "Quiet precision, honest timelines and zero-compromise quality — the Nordic standard applied to every engagement." },
  { n: "02", title: "Global by design", desc: "Delivery across countries and time zones with remote-first consultation, multilingual teams and 18-language support." },
  { n: "03", title: "Security-first mindset", desc: "GDPR-grade privacy engineering, secure development practices and infrastructure built for regulated environments." },
  { n: "04", title: "Future-focused technology", desc: "AI integration, modern data platforms and product engineering that keep our clients ahead of the curve." },
];

export const SOLUTIONS = [
  { title: "Business Digital Transformation", desc: "Modernize operations end-to-end: process digitization, cloud migration and platform strategy.", tags: ["Strategy", "Cloud", "Change"] },
  { title: "IT Infrastructure", desc: "Reliable networks, devices, maintenance and managed environments that simply work.", tags: ["Hardware", "Networks", "Support"] },
  { title: "Software & Application Development", desc: "Custom web, mobile and enterprise applications engineered around your goals.", tags: ["Web", "Mobile", "APIs"] },
  { title: "AI & Automation", desc: "Practical AI integration and workflow automation that survive contact with production.", tags: ["AI", "Automation", "LLMs"] },
  { title: "Data & Analytics", desc: "Reporting, dashboards and decision-grade insight from the data you already own.", tags: ["BI", "Dashboards", "Pipelines"] },
  { title: "Quality Assurance", desc: "Functional, performance and automated testing that protects your reputation.", tags: ["Testing", "Automation", "Audits"] },
  { title: "Technical Support", desc: "Service desk, troubleshooting and maintenance for teams of any size.", tags: ["Service Desk", "SLA", "Remote"] },
  { title: "Remote Technology Consulting", desc: "Expert guidance delivered remotely, in your timezone and your language.", tags: ["Advisory", "CTO-as-a-Service", "Global"] },
  { title: "On-Board Courier (OBC)", desc: "Time-critical hand-carry delivery via vetted courier partners — flight cost upfront, balance after proof of delivery.", tags: ["OBC", "Hand-carry", "Time-critical"] },
];

export const INDUSTRIES = [
  "Legal", "Healthcare", "Finance", "Education", "Retail", "Government",
  "Logistics", "Professional Services", "Technology", "Startups", "SMEs",
];

export const KAGAYO_FEATURES = [
  { title: "Meet the law, simply", desc: "Connect with legal guidance through an interface designed for humans, not lawyers." },
  { title: "Mobile & web, unified", desc: "One platform across iOS, Android and browser — your matters follow you everywhere." },
  { title: "Privacy by architecture", desc: "Encrypted documents, GDPR-grade data handling and jurisdictional awareness built in." },
  { title: "Backed by Yobsman-Tech", desc: "Engineered inside the Yobsman-Tech ecosystem with enterprise security standards." },
];

export const MARQUEE_ITEMS = [
  "Reason without Limit", "Espoo · Helsinki", "Global IT Services", "AI Integration",
  "KAGAYO — The Law Meet", "Software Engineering", "18 Languages", "Remote Consultation",
  "Quality Assured", "GDPR by Design",
];
