/** Shared interactive button styles (Tailwind). */
export const btnBase =
  "cursor-pointer transition-all duration-200 hover:scale-105 active:scale-[0.98] focus:outline-none";

export const btnPrimary = `${btnBase} rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`;

export const btnAccent = `${btnBase} rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90`;

export const btnSecondary = `${btnBase} rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:opacity-90`;

export const btnSmall = `${btnBase} rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200`;

export const btnPill = `${btnBase} rounded-full border px-3 py-1 text-[11px] font-semibold hover:opacity-90`;

export const btnDangerPill = `${btnPill} border-red-300 bg-red-50 text-red-800`;

export const btnNeutralPill = `${btnPill} border-slate-200 bg-slate-50 text-slate-700 hover:bg-white`;

export const btnIndigoPill = `${btnPill} border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100`;

export const btnAmber = `${btnBase} rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90`;
