/*
 * ==========================================================
 *  CONTENT OF THE SITE: edit this file to update the site.
 * ==========================================================
 *
 *  SITE      → your name, titles, contact info and links.
 *  PROJECTS  → one block per project, shown in this order
 *              on the home page (first = top of the page).
 *
 *  Layout (automatic, from the order below):
 *    1st project          → whole row
 *    then blocks of three → 1 big + 2 small stacked, the big one alternating left / right:
 *        [   1 (whole row)   ]
 *        [   2 big   |   3   ]
 *        [           |   4   ]
 *        [   5   |   7 big   ]
 *        [   6   |           ]
 *        [   8 big   |   9   ]   ...
 *    Big tiles are the 2nd, 7th, 8th, 13th, 14th... projects: give them your sharpest images.
 *    A last block of two projects becomes two halves, a last single project a whole row.
 *
 *  Project fields:
 *    id        unique short name, lowercase, no spaces (used in the URL)
 *    title     project title
 *    client    client / artist / brand (optional)
 *    category  one of: "music-videos", "corporate", "events", "films"
 *    role      your role on the project, e.g. "Director & DOP"
 *    video     YouTube, Vimeo or public Facebook video/reel link (optional; leave "" if none yet).
 *              The hover preview only works with YouTube (or a "preview" clip, see below).
 *    cover     cover image: path to a file in the images/ folder, e.g. "images/my-project.jpg"
 *    credits   list of extra credits shown on the project page (optional)
 *    stills    list of extra images shown under the video (optional)
 *    preview   short silent clip played when the mouse is over the cover (optional),
 *              e.g. "videos/my-project.mp4". Without it, a YouTube video plays muted on hover instead.
 *    previewStart  second at which the YouTube hover preview starts (optional, default 0)
 *    previewZoom   zoom of the YouTube hover preview (optional, default 1.2; 1.4 hides the black bars
 *                  of a cinemascope or 4:3 video)
 */

const SITE = {
  theme: "dark",   // "dark" = black background, "light" = white background
  name: "Maxime Baldewyns",
  titles: ["Director", "DOP", "Camera Operator", "Editor"],
  email: "contact@maximebaldewyns.com",
  phone: "",
  location: "Belgium",
  reel: "",   // showreel link (Vimeo or YouTube); the "reel" tab appears once it is filled
  social: {
    instagram: "",
    vimeo: "",
    imdb: "",
    linkedin: ""
  },
  about: "Maxime Baldewyns is a director, director of photography and camera operator working across commercials, music videos, corporate films, events and narrative projects.",
  // "about me" page: portrait in images/ and one string per paragraph (until filled, the short text above is used)
  photo: "images/about-maxime.jpg",
  bio: [
    "Hi, I’m Maxime! For the past eight years, I’ve been working as a freelance director, DOP, camera operator and editor, bringing corporate, institutional, documentary, and narrative stories to life.",
    "On set, I’m known for being efficient, conscientious, and highly adaptable to any environment. My background is actually in music—I studied jazz guitar at the Royal Conservatory of Brussels—which gives me a unique edge when it comes to capturing and editing sound. It allows me to confidently manage shoots entirely on my own.",
    "I love a good challenge, whether that means turning around a well-paced edit on a tight timeline or incorporating motion design to elevate the project."
  ]
};

const CATEGORIES = [
  { id: "music-videos", label: "music videos" },
  { id: "corporate",    label: "corporate" },
  { id: "events",       label: "events" },
  { id: "films",        label: "films" }
];

const PROJECTS = [
  {
    id: "brosella-2026",
    title: "Brosella 2026",
    client: "Teaser",
    category: "events",
    role: "Director, Camera Operator & Editor",
    video: "https://www.youtube.com/watch?v=xDq94wBVHU8",
    cover: "images/brosella-2026.jpg",
  },
  {
    id: "elia-rose-love-is-all-i-need",
    title: "Love Is All I Need",
    client: "Elia Rose",
    category: "music-videos",
    role: "Director & Editor",
    video: "https://www.youtube.com/watch?v=kOtqKGNVBa0",
    cover: "images/elia-rose-love-is-all-i-need.jpg",
    previewZoom: 1.4,
  },
  {
    id: "totalenergies-lubriclean",
    title: "Lubriclean",
    client: "TotalEnergies",
    category: "corporate",
    role: "Director & Editor",
    video: "https://www.youtube.com/watch?v=3GSNd_CkULE",
    cover: "images/totalenergies-lubriclean.jpg",
  },
  {
    id: "olive-accro",
    title: "Accro",
    client: "Olive",
    category: "music-videos",
    role: "Director & Editor",
    video: "https://www.youtube.com/watch?v=Cd9SZyTLDIE",
    cover: "images/olive-accro.jpg",
    previewZoom: 1.4,
  },
  {
    id: "midnight-the-stars-and-you",
    title: "Midnight, the Stars and You",
    client: "Guillaume Lepoutre",
    category: "music-videos",
    role: "Director & Camera Operator",
    video: "https://www.youtube.com/watch?v=gZRcvW_QjB0",
    cover: "images/midnight-the-stars-and-you.jpg",
  },
  {
    id: "brosella-2025",
    title: "Brosella 2025",
    client: "Aftermovie",
    category: "events",
    role: "Director, Camera Operator & Editor",
    video: "https://www.youtube.com/watch?v=jhJh5DKRbJI",
    cover: "images/brosella-2025.jpg",
  },
  {
    id: "ground-zero",
    title: "Ground Zero",
    client: "The Terminal ft. Fleddy Melculy",
    category: "music-videos",
    role: "Director & Editor",
    video: "https://www.youtube.com/watch?v=W7G8yetS4O8",
    cover: "images/ground-zero.jpg",
    previewZoom: 1.4,
  },
  {
    id: "tcha-limberger-cuando-yo-me-muera",
    title: "Cuando yo me muera",
    client: "Tcha Limberger",
    category: "music-videos",
    role: "Director & Camera Operator",
    video: "https://www.youtube.com/watch?v=DidMTWhQLoM",
    cover: "images/tcha-limberger-cuando-yo-me-muera.jpg",
  },
  {
    id: "lorenzo-di-maio-the-chase",
    title: "The Chase (Live Session)",
    client: "Lorenzo Di Maio",
    category: "music-videos",
    role: "Director",
    video: "https://www.youtube.com/watch?v=EY0tZB_D5nE",
    cover: "images/lorenzo-di-maio-the-chase.jpg",
  },
  {
    id: "olive-l-ere-de-rien",
    title: "L’ère de rien",
    client: "Olive",
    category: "music-videos",
    role: "DOP & Editor",
    video: "https://www.youtube.com/watch?v=oSzTUz5vdHI",
    cover: "images/olive-l-ere-de-rien.jpg",
  },
  {
    id: "bxl-tour-2026",
    title: "BXL Tour 2026",
    client: "Aftermovie",
    category: "events",
    role: "Camera Operator",
    video: "https://www.facebook.com/reel/1328833775896959",
    cover: "images/bxl-tour-2026.jpg",
  },
  {
    id: "trg-saison-26-27",
    title: "C’est pas facile d’être heureux quand on va mal",
    client: "Théâtre Royal des Galeries",
    category: "corporate",
    role: "Director, DOP & Editor",
    video: "https://www.youtube.com/watch?v=ORj2DsxwA6Q",
    cover: "images/trg-saison-26-27.jpg",
  },
  {
    id: "trg-secrets",
    title: "Secret.s",
    client: "Théâtre Royal des Galeries",
    category: "corporate",
    role: "Director, DOP & Editor",
    video: "https://www.youtube.com/watch?v=rKUwpS0yb0I",
    cover: "images/trg-secrets.jpg",
    previewZoom: 1.4,
  },
  {
    id: "trg-glenn",
    title: "Glenn, naissance d’un prodige",
    client: "Théâtre Royal des Galeries",
    category: "corporate",
    role: "Director, DOP & Editor",
    video: "https://www.youtube.com/watch?v=5GkC_PJpU58",
    cover: "images/trg-glenn.jpg",
  },
  {
    id: "trg-l-ecume-des-jours",
    title: "L’Écume des jours",
    client: "Théâtre Royal des Galeries",
    category: "corporate",
    role: "Camera Operator & Editor",
    video: "https://www.youtube.com/watch?v=zHUwTVhNe08",
    cover: "images/trg-l-ecume-des-jours.jpg",
  },
  {
    id: "brosella-bxl-ldn-interplay",
    title: "BXL × LDN Interplay",
    client: "Brosella Festival & Tomorrow’s Warriors",
    category: "events",
    role: "Director, DOP & Editor",
    video: "https://www.youtube.com/watch?v=SrCy4lrNBPk",
    cover: "images/brosella-bxl-ldn-interplay.jpg",
  },
  {
    id: "jean-paul-lespagnard-interview",
    title: "Jean-Paul Lespagnard",
    client: "Interview",
    category: "corporate",
    role: "Director, DOP & Editor",
    video: "https://www.youtube.com/watch?v=Kn1q0F4GRmU",
    cover: "images/jean-paul-lespagnard-interview.jpg",
  },
];

/*
 * FILMS → posters shown only on the "films" page (never on the home page),
 * from the credits on IMDb (https://www.imdb.com/name/nm10255860/). Shown in this order.
 *    poster          image in images/films/ (leave "" to show the title on a plain card)
 *    posterPosition  which part of the image to keep when it doesn't fit the poster frame (optional)
 *    link            page opened when the poster is clicked
 */
const FILMS = [
  {
    title: "Comme l'eau",
    year: 2021,
    director: "Alice Moons",
    role: "Director of Photography",
    poster: "images/films/comme-l-eau.jpg",
    link: "https://www.imdb.com/title/tt27789259/"
  },
  {
    title: "Le choix",
    year: 2022,
    director: "Michel Meulenijzer & Arthur David",
    role: "Director of Photography",
    poster: "images/films/le-choix.jpg",
    link: "https://www.youtube.com/watch?v=XTPbzFyS0TA"
  },
  {
    title: "Le Jour 23",
    year: 2019,
    director: "Giancarlo Rocconi",
    role: "Director of Photography",
    poster: "images/films/le-jour-23.jpg",
    link: "https://www.imdb.com/title/tt9691442/"
  },
  {
    title: "Quand brillera la nuit",
    year: 2018,
    director: "Lionel Merckx",
    role: "Camera Assistant",
    poster: "images/films/quand-brillera-la-nuit.jpg",
    link: "https://www.imdb.com/title/tt9268772/"
  },
  {
    title: "Manès",
    year: 2018,
    director: "François Carlier",
    role: "Electrician",
    poster: "images/films/manes.jpg",
    posterPosition: "70% center",
    link: "https://www.imdb.com/title/tt9269910/"
  },
  {
    title: "Une super limonade",
    year: 2024,
    director: "Alessandro Duca",
    role: "Director of Photography",
    poster: "images/films/une-super-limonade.jpg",
    link: "https://www.imdb.com/title/tt33482126/"
  }
];
