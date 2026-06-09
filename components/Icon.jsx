/* Minimal inline icon set (stroke, currentColor). Keys match content.js. */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PATHS = {
  clipboard: <><rect x="8" y="4" width="8" height="3.5" rx="1" {...P} /><path d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V7a1.5 1.5 0 0 0-1.5-1.5H16M8 12h8M8 16h5" {...P} /></>,
  hospital: <><path d="M5 20V7l7-3 7 3v13" {...P} /><path d="M3 20h18M12 9v5M9.5 11.5h5" {...P} /></>,
  alert: <><path d="M12 4 2.5 20h19L12 4Z" {...P} /><path d="M12 10v4M12 17h.01" {...P} /></>,
  trend: <><path d="M4 7l7 7 3-3 6 6" {...P} /><path d="M20 17v-4h-4" {...P} /></>,
  heart: <path d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6c0 4.8-7 9.4-7 9.4Z" {...P} />,
  home: <><path d="M4 11l8-6 8 6" {...P} /><path d="M6 10v9h12v-9" {...P} /><path d="M10 19v-5h4v5" {...P} /></>,
  brain: <path d="M9 6a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 5 11a2.5 2.5 0 0 0 1.5 2.3A2.5 2.5 0 0 0 9 18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-1Zm6 0a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 19 11a2.5 2.5 0 0 1-1.5 2.3A2.5 2.5 0 0 1 15 18a2 2 0 0 1-2-2V7a2 2 0 0 1 2-1Z" {...P} />,
  sunset: <><path d="M3 18h18M7 18a5 5 0 0 1 10 0" {...P} /><path d="M12 3v4M5 8l1.5 1.5M19 8l-1.5 1.5M2 14h2M20 14h2" {...P} /></>,
  pin: <><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" {...P} /><circle cx="12" cy="11" r="2.2" {...P} /></>,
  child: <><circle cx="12" cy="6" r="2.2" {...P} /><path d="M9 21v-5l-1.5-2.5A2 2 0 0 1 9.3 10h5.4a2 2 0 0 1 1.8 3.5L15 16v5" {...P} /></>,
  lifebuoy: <><circle cx="12" cy="12" r="8" {...P} /><circle cx="12" cy="12" r="3.2" {...P} /><path d="M5 5l4.2 4.2M14.8 14.8 19 19M19 5l-4.2 4.2M9.2 14.8 5 19" {...P} /></>,
  compass: <><circle cx="12" cy="12" r="8.4" {...P} /><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" {...P} /></>,
  check: <path d="M5 12.5l4 4 10-10" {...P} />,
  phone: <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L15.5 12l4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A14 14 0 0 1 5 5.6 1.5 1.5 0 0 1 6.5 4Z" {...P} />,
  external: <><path d="M14 5h5v5" {...P} /><path d="M19 5l-8 8" {...P} /><path d="M18 13v5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8A1.5 1.5 0 0 1 6.5 6.5h5" {...P} /></>,
  arrow: <path d="M5 12h13M13 6l6 6-6 6" {...P} />,
  back: <path d="M19 12H6M11 6l-5 6 5 6" {...P} />,
  x: <path d="M6 6l12 12M18 6 6 18" {...P} />,
  info: <><circle cx="12" cy="12" r="8.4" {...P} /><path d="M12 11v5M12 8h.01" {...P} /></>,
};

export default function Icon({ name, size = 22, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {PATHS[name] || PATHS.info}
    </svg>
  );
}
