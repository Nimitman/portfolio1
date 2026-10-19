/** Prefix an internal path with the deploy base (e.g. /portfolio1 on GitHub Pages). */
export const url = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;
