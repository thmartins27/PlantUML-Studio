import type { ReactNode } from 'react';

const paths = {
  code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" /></>,
  file: <><path d="M14 3H6a1 1 0 0 0-1 1v16h14V8zM14 3v5h5" /></>,
  folder: <path d="M3 6h6l2 2h10v12H3z" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4" /></>,
  moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />,
  export: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" /></>,
  play: <path d="m7 4 13 8-13 8z" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
  minus: <path d="M5 12h14" />,
  plus: <path d="M5 12h14M12 5v14" />,
  fit: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
  alert: <><path d="m12 3 10 18H2zM12 9v5m0 3v1" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 4 4 4-6 5 7" /><circle cx="8" cy="7" r="1" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
