/* Builds every page from content.js. No need to edit this file to add projects. */

(function () {
  const body = document.body;
  const page = body.dataset.page;
  const currentCategory = body.dataset.category || "";
  const main = document.getElementById("main");

  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const categoryLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || "";

  // Phone browser bar takes the background color of the current theme
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();

  /* ---------- Header & footer ---------- */

  function renderHeader() {
    const links = CATEGORIES.map((c) => ({ href: c.id + ".html", label: c.label, active: c.id === currentCategory }))
      .concat([
        // the reel tab only shows once a showreel link is set in content.js
        ...(SITE.reel ? [{ href: "reel.html", label: "reel", active: page === "reel" }] : []),
        { href: "about.html", label: "about me", active: page === "about" },
        { href: "contact.html", label: "contact", active: page === "contact" }
      ]);

    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <a class="brand" href="index.html">
        <div class="brand-name">${esc(SITE.name)}</div>
        <div class="brand-titles">${SITE.titles.map(esc).join(" · ")}</div>
      </a>
      <button class="menu-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
      <nav class="nav">
        ${links.map((l) => `<a href="${l.href}"${l.active ? ' class="active"' : ""}>${esc(l.label)}</a>`).join("")}
      </nav>`;
    body.prepend(header);

    const toggle = header.querySelector(".menu-toggle");
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  function socialLinks() {
    const names = { instagram: "Instagram", vimeo: "Vimeo", imdb: "IMDb", linkedin: "LinkedIn" };
    return Object.entries(SITE.social)
      .filter(([, url]) => url)
      .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${names[k] || k}</a>`);
  }

  function renderFooter() {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <span>© ${new Date().getFullYear()} ${esc(SITE.name)}</span>
      <span class="links">${[`<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`].concat(socialLinks()).join("")}</span>`;
    body.append(footer);
  }

  /* ---------- Video embeds ---------- */

  function youtubeId(url) {
    const m = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : "";
  }

  function embedUrl(url) {
    if (!url) return "";
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?${m[2] ? "h=" + m[2] + "&" : ""}title=0&byline=0&portrait=0&dnt=1`;
    const yt = youtubeId(url);
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`;
    // Facebook video or reel (public): facebook.com/reel/ID, /videos/ID or /watch/?v=ID
    const fb = url.match(/facebook\.com\/(?:reel\/|watch\/?\?v=|[^/]+\/videos\/(?:[^/]+\/)?)(\d+)/);
    if (fb) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(`https://www.facebook.com/watch/?v=${fb[1]}`)}&show_text=false&width=1280`;
    return "";
  }

  // Loads the YouTube player API once, on the first hover that needs it.
  let youtubeApi;
  function loadYoutubeApi() {
    if (!youtubeApi) {
      youtubeApi = new Promise((resolve) => {
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.append(s);
      });
    }
    return youtubeApi;
  }

  /* ---------- Pages ---------- */

  // layout "mosaic" (home page) or "rows" (category pages: rows of 3 equal videos)
  function renderGrid(list, layout = "mosaic") {
    if (!list.length) {
      main.innerHTML = `<p class="empty">New work coming soon.</p>`;
      return;
    }
    const places = layout === "rows"
      ? list.map(() => ({ size: "third", col: "auto / span 2", row: "auto" }))
      : mosaic(list.length);

    main.innerHTML = `<div class="grid">${list.map((p, i) => {
      // Hover preview: a dedicated clip if there is one, otherwise the YouTube video itself.
      const yt = p.preview ? "" : youtubeId(p.video);
      const hasPreview = p.preview || yt;
      const pl = places[i];
      return `
      <a class="tile reveal ${pl.size}${hasPreview ? " has-preview" : ""}" style="--col:${pl.col};--row:${pl.row}" href="project.html?id=${encodeURIComponent(p.id)}"${yt ? ` data-yt="${yt}" data-start="${Number(p.previewStart) || 0}"` : ""}>
        <img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}">
        ${p.preview ? `<video class="tile-video" src="${esc(p.preview)}" muted loop playsinline preload="none"></video>` : ""}
        ${yt ? `<div class="tile-video tile-yt"${p.previewZoom ? ` style="--zoom:${Number(p.previewZoom)}"` : ""}><div></div></div>` : ""}
        <div class="tile-info">
          <div class="tile-title">${esc(p.title)}</div>
          ${p.client ? `<div class="tile-client">${esc(p.client)}</div>` : ""}
        </div>
      </a>`;
    }).join("")}</div>`;

    hoverPreviews();
  }

  // Films page: any "films" projects (with video) first, then the wall of posters from FILMS.
  function renderFilms() {
    const projects = PROJECTS.filter((p) => p.category === "films");
    const films = typeof FILMS === "undefined" ? [] : FILMS;
    if (projects.length || !films.length) renderGrid(projects, "rows");
    else main.innerHTML = "";
    if (!films.length) return;

    const wall = document.createElement("section");
    wall.className = "posters";
    // A film without a link is shown as a plain (non-clickable) card.
    wall.innerHTML = films.map((f) => {
      const tag = f.link ? "a" : "div";
      return `
      <${tag} class="poster reveal"${f.link ? ` href="${esc(f.link)}" target="_blank" rel="noopener"` : ""}>
        <div class="poster-img">
          ${f.poster
            ? `<img src="${esc(f.poster)}" alt="${esc(f.title)} poster" loading="lazy"${f.posterPosition ? ` style="object-position:${esc(f.posterPosition)}"` : ""}>`
            : `<div class="poster-blank"><strong>${esc(f.title)}</strong>${f.director ? `<span>${esc(f.director)}</span>` : ""}</div>`}
        </div>
        <div class="poster-caption">
          <div>${esc(f.title)}</div>
          <div class="meta">${[f.year, f.role].filter(Boolean).map(esc).join(" · ")}</div>
        </div>
      </${tag}>`;
    }).join("");
    main.append(wall);
  }

  // Layout in the spirit of adolphoveloso.com, on a 6-column grid:
  // the first project takes the whole row, then blocks of three alternate
  //   [ big  | small ]        [ small |  big ]
  //   [      | small ]   then [ small |      ]   and so on.
  // A last block of two becomes two halves, a last single project a full row.
  function mosaic(count) {
    const places = [];
    const add = (size, col, row, rows = 1) => places.push({ size, col, row: `${row} / span ${rows}` });
    let row = 1;
    let i = 0;
    let block = 0;
    if (count) { add("full", "1 / -1", row++); i = 1; }
    while (i < count) {
      const left = count - i;
      if (left >= 3) {
        if (block % 2 === 0) {
          add("big", "1 / 5", row, 2);
          add("small", "5 / 7", row);
          add("small", "5 / 7", row + 1);
        } else {
          add("small", "1 / 3", row);
          add("small", "1 / 3", row + 1);
          add("big", "3 / 7", row, 2);
        }
        row += 2; i += 3; block++;
      } else if (left === 2) {
        add("half", "1 / 4", row);
        add("half", "4 / 7", row++);
        i += 2;
      } else {
        add("full", "1 / -1", row++);
        i++;
      }
    }
    return places;
  }

  // Silent preview that plays while the mouse is over a tile (desktop only).
  function hoverPreviews() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    main.querySelectorAll(".tile.has-preview").forEach((tile) => {
      if (tile.dataset.yt) return youtubeHover(tile);
      const video = tile.querySelector(".tile-video");
      video.addEventListener("playing", () => tile.classList.add("playing"));
      tile.addEventListener("mouseenter", () => {
        video.muted = true;
        const p = video.play();
        if (p) p.catch(() => {});
      });
      tile.addEventListener("mouseleave", () => {
        tile.classList.remove("playing");
        video.pause();
      });
    });
  }

  // YouTube shows a pause button over the video for a few seconds every time playback starts or
  // resumes, and it cannot be turned off. So the player stays hidden behind the cover until that
  // button is gone, then keeps playing (invisible) while the tile is on screen: later hovers
  // show it instantly. It is paused only when the tile scrolls out of view.
  const YT_OVERLAY_MS = 3000;

  function youtubeHover(tile) {
    const id = tile.dataset.yt;
    const start = Number(tile.dataset.start) || 0;
    const slot = tile.querySelector(".tile-yt > div");
    let player = null;
    let hovering = false;
    let readyAt = 0; // time from which the current playback is free of YouTube's overlay
    let revealTimer;

    const reveal = () => {
      clearTimeout(revealTimer);
      if (!hovering || !readyAt) return;
      const wait = readyAt - Date.now();
      if (wait > 0) revealTimer = setTimeout(reveal, wait);
      else tile.classList.add("playing");
    };

    tile.addEventListener("mouseenter", () => {
      hovering = true;
      if (player) {
        if (player.getPlayerState && player.getPlayerState() !== 1) player.playVideo();
        reveal();
        return;
      }
      player = {};
      loadYoutubeApi().then((YT) => {
        player = tile.ytPlayer = new YT.Player(slot, {
          host: "https://www.youtube-nocookie.com",
          videoId: id,
          // No YouTube "loop/playlist" mode: it adds previous/next buttons over the video.
          playerVars: {
            autoplay: 1, mute: 1, controls: 0,
            rel: 0, modestbranding: 1, disablekb: 1, fs: 0, iv_load_policy: 3, start
          },
          events: {
            onReady: (e) => e.target.mute(),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) {
                if (!readyAt) readyAt = Date.now() + YT_OVERLAY_MS;
                reveal();
              } else if (e.data === YT.PlayerState.ENDED) {
                readyAt = 0;
                tile.classList.remove("playing");
                e.target.seekTo(start, true);
                e.target.playVideo();
              } else if (e.data === YT.PlayerState.PAUSED) {
                readyAt = 0;
              }
            }
          }
        });
      });
    });

    tile.addEventListener("mouseleave", () => {
      hovering = false;
      clearTimeout(revealTimer);
      tile.classList.remove("playing");
    });

    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting && player && player.pauseVideo) {
        player.pauseVideo();
        readyAt = 0;
      }
    }).observe(tile);
  }

  function renderProject() {
    const id = new URLSearchParams(location.search).get("id");
    const index = PROJECTS.findIndex((p) => p.id === id);
    const p = PROJECTS[index];
    if (!p) {
      main.innerHTML = `<p class="empty">Project not found. <a href="index.html">Back to all work</a></p>`;
      return;
    }
    document.title = `${p.title} | ${SITE.name}`;

    const embed = embedUrl(p.video);
    const player = embed
      ? `<iframe src="${esc(embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(p.title)}"></iframe>`
      : `<img src="${esc(p.cover)}" alt="${esc(p.title)}">`;

    const credits = [`<li><strong>${esc(p.role)}</strong></li>`]
      .concat((p.credits || []).map((c) => `<li>${esc(c)}</li>`))
      .concat(categoryLabel(p.category) ? [`<li>${esc(categoryLabel(p.category))}</li>`] : []);

    const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(index + 1) % PROJECTS.length];

    main.innerHTML = `
      <div class="player">${player}</div>
      <div class="project-meta">
        <div>
          <h1>${esc(p.title)}</h1>
          ${p.client ? `<p class="client">${esc(p.client)}</p>` : ""}
        </div>
        <ul class="credits">${credits.join("")}</ul>
      </div>
      ${(p.stills || []).length ? `<div class="stills">${p.stills.map((s) => `<img class="reveal" src="${esc(s)}" alt="${esc(p.title)} still" loading="lazy">`).join("")}</div>` : ""}
      <nav class="pager">
        <a href="project.html?id=${encodeURIComponent(prev.id)}">← ${esc(prev.title)}</a>
        <a href="project.html?id=${encodeURIComponent(next.id)}">${esc(next.title)} →</a>
      </nav>`;
  }

  function renderReel() {
    const embed = embedUrl(SITE.reel);
    main.innerHTML = embed
      ? `<div class="player"><iframe src="${esc(embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Showreel"></iframe></div>`
      : `<p class="empty">Showreel coming soon.</p>`;
  }

  // About me: portrait on the left, text on the right (stacked on mobile).
  function renderAbout() {
    const paragraphs = SITE.bio && SITE.bio.length ? SITE.bio : [SITE.about];
    main.innerHTML = `
      <section class="about">
        <div class="about-photo">
          ${SITE.photo ? `<img class="reveal" src="${esc(SITE.photo)}" alt="${esc(SITE.name)}">` : ""}
        </div>
        <div class="about-text page-text">
          <h1>about me</h1>
          ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
          <p class="muted"><a href="contact.html">Get in touch →</a></p>
        </div>
      </section>`;
  }

  function renderContact() {
    const items = [
      `<li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>`,
      SITE.phone ? `<li><a href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a></li>` : "",
      ...socialLinks().map((a) => `<li>${a}</li>`)
    ].join("");
    main.innerHTML = `
      <section class="page-text">
        <h1>contact</h1>
        <p>${esc(SITE.about)}</p>
        ${SITE.location ? `<p class="muted">Based in ${esc(SITE.location)}. Available for projects worldwide.</p>` : ""}
        <ul class="contact-list">${items}</ul>
      </section>`;
  }

  /* ---------- Fade-in on scroll ---------- */

  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Page transitions ---------- */

  // Internal links fade the page out (0.3 s, see style.css) before navigating.
  function pageTransitions() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return; // external sites, mailto:, tel:
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / #anchor
      e.preventDefault();
      body.classList.remove("menu-open"); // close the mobile menu while the content fades out
      body.classList.add("leaving");
      setTimeout(() => { location.href = url.href; }, 300);
    });
    // Coming back with the browser's back button: show the page again
    window.addEventListener("pageshow", (e) => { if (e.persisted) body.classList.remove("leaving"); });
  }

  /* ---------- Go ---------- */

  renderHeader();
  if (page === "home") renderGrid(PROJECTS);
  else if (page === "category") {
    if (currentCategory === "films") renderFilms();
    else renderGrid(PROJECTS.filter((p) => p.category === currentCategory), "rows");
    document.title = `${categoryLabel(currentCategory)} | ${SITE.name}`;
  }
  else if (page === "project") renderProject();
  else if (page === "reel") renderReel();
  else if (page === "about") renderAbout();
  else if (page === "contact") renderContact();
  renderFooter();
  reveal();
  pageTransitions();
})();
