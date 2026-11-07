// All photos are served from /public/media — nothing is loaded from other websites.
// Each entry is a list of sources: the first one that loads wins. If none load,
// the page shows a gradient (login) or a generated mountain illustration (trails).

export const media = {
  login: ['/media/login.jpg'],
  loginVideo: '/media/login.mp4', // optional; skipped if missing
  hero: ['/media/hero.jpg'],
  hiker: ['/media/hiker.jpg'],
  /** Optional cover per trail: /public/media/trails/<trail-id>.jpg */
  trail: (id: string) => `/media/trails/${id}.jpg`,
};
