import type { ReactNode } from 'react';

const paths = {
  code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" /></>,
  file: <><path d="M14 3H6a1 1 0 0 0-1 1v16h14V8zM14 3v5h5" /></>,
  folder: <path d="M3 6h6l2 2h10v12H3z" />,
  folderOpen: <><path d="M3 7h6l2 2h10l-2 11H3z" /><path d="M3 7V5h7l2 2" /></>,
  folderUpload: <><path d="M3 7h6l2 2h10v11H3z" /><path d="M15 7V2m-3 3 3-3 3 3" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4" /></>,
  moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />,
  export: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" /></>,
  upload: <><path d="M12 8v13m-5-8 5-5 5 5M4 9V3h16v6" /></>,
  play: <path d="m7 4 13 8-13 8z" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
  minus: <path d="M5 12h14" />,
  plus: <path d="M5 12h14M12 5v14" />,
  reset: <><path d="M4 4v6h6" /><path d="M5.5 17.5A8 8 0 1 0 4 10" /></>,
  fit: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
  fullscreen: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
  fullscreenExit: <path d="M9 9H3m6 0V3m6 6h6m-6 0V3M9 15H3m6 0v6m6-6h6m-6 0v6" />,
  main: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  alert: <><path d="m12 3 10 18H2zM12 9v5m0 3v1" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 4 4 4-6 5 7" /><circle cx="8" cy="7" r="1" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  save: <><path d="M5 3h12l3 3v15H4V3z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
  edit: <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z" /><path d="m14 7 3 3" /></>,
  trash: <><path d="M4 7h16M9 3h6l1 4H8zM6 7l1 14h10l1-14M10 11v6m4-6v6" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
