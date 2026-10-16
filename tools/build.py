#!/usr/bin/env python3
"""Builds the site's HTML pages, sitemap.xml and robots.txt from content.js.

Run it from the site folder after editing content.js:

    python3 tools/build.py

Every page gets its own title, description, link preview (Open Graph) and
Google structured data, and each project gets its own address: /work/<id>/.
What visitors see is still drawn in the browser by assets/site.js; these
pages give search engines and link previews the right information up front.
"""

import datetime
import html
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSC = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"

KIND = {  # what a project is, per category, in descriptions
    "music-videos": "Music video",
    "corporate": "Corporate film",
    "events": "Event film",
    "films": "Short film",
}


def load_content():
    """Reads content.js with the JavaScript engine built into macOS."""
    src = open(os.path.join(ROOT, "content.js"), encoding="utf-8").read()
    code = src + "\nprint(JSON.stringify({SITE, CATEGORIES, PROJECTS, FILMS: typeof FILMS === 'undefined' ? [] : FILMS}));"
    if not os.path.exists(JSC):
        sys.exit("JavaScriptCore was not found: this script needs macOS.")
    out = subprocess.run([JSC, "-e", code], capture_output=True, text=True)
    if out.returncode != 0 or not out.stdout.strip():
        sys.exit("content.js could not be read (check for a typo, e.g. a missing comma):\n" + (out.stderr or out.stdout))
    return json.loads(out.stdout)


def esc(s):
    return html.escape(str(s or ""), quote=True)


def youtube_id(url):
    m = re.search(r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})", url or "")
    return m.group(1) if m else ""


def embed_url(url):
    m = re.search(r"vimeo\.com/(?:video/)?(\d+)", url or "")
    if m:
        return f"https://player.vimeo.com/video/{m.group(1)}"
    yt = youtube_id(url)
    if yt:
        return f"https://www.youtube.com/embed/{yt}"
    m = re.search(r"facebook\.com/(?:reel/|watch/?\?v=|[^/]+/videos/(?:[^/]+/)?)(\d+)", url or "")
    if m:
        return f"https://www.facebook.com/watch/?v={m.group(1)}"
    return ""


def role_verbs(role):
    """'Director, DOP & Editor' -> 'directed, shot and edited'."""
    r = (role or "").lower()
    verbs = []
    if re.search(r"\bdirector\b(?! of photography)", r):
        verbs.append("directed")
    if "dop" in r or "director of photography" in r:
        verbs.append("shot")
    elif "camera" in r:
        verbs.append("filmed")
    if "editor" in r:
        verbs.append("edited")
    if "assistant" in r and not verbs:
        verbs.append("assisted on camera")
    if not verbs:
        return "made"
    return verbs[0] if len(verbs) == 1 else ", ".join(verbs[:-1]) + " and " + verbs[-1]


def shorten(text, limit=158):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:—-")
    return cut + "…"


def postal_address(where):
    """'Brussels, Belgium' -> PostalAddress with city and country code."""
    parts = [s.strip() for s in where.split(",") if s.strip()]
    if not parts:
        return None
    address = {"@type": "PostalAddress"}
    if len(parts) > 1:
        address["addressLocality"] = parts[0]
    address["addressCountry"] = {"belgium": "BE", "france": "FR"}.get(parts[-1].lower(), parts[-1])
    return address


def main():
    c = load_content()
    site, categories, projects, films = c["SITE"], c["CATEGORIES"], c["PROJECTS"], c["FILMS"]
    url = site.get("url", "").rstrip("/")
    name = site["name"]
    where = site.get("location") or ""
    based = f" based in {where}" if where else ""
    jobs = "director, DOP, camera operator and editor"
    today = datetime.date.today().isoformat()
    abs_url = lambda path: f"{url}/{path}" if path else f"{url}/"
    label = {cat["id"]: cat["label"] for cat in categories}

    socials = [u for u in (site.get("social") or {}).values() if u]
    person = {
        "@type": "Person",
        "@id": f"{url}/#person",
        "name": name,
        "url": f"{url}/",
        "jobTitle": ", ".join(site.get("titles") or []),
        "email": f"mailto:{site['email']}" if site.get("email") else None,
        "image": abs_url(site["photo"]) if site.get("photo") else None,
        "address": postal_address(where),
        "sameAs": socials or None,
    }
    person = {k: v for k, v in person.items() if v}

    def project_desc(p):
        if p.get("description"):
            return shorten(p["description"])
        head = p["title"] + (f" – {p['client']}" if p.get("client") else "")
        verbs = role_verbs(p.get("role"))
        lead = f"{head}. {KIND.get(p.get('category'), 'Video')} {verbs} by {name}"
        where_tail = f",{based}." if based else "."
        # Drop job titles, then the kind of film, before dropping the city: the location matters more for search.
        options = (lead + f", {jobs}{based}.", lead + f", director and DOP{based}.", lead + where_tail,
                   f"{head}. {verbs[:1].upper() + verbs[1:]} by {name}{where_tail}")
        return next((o for o in options if len(o) <= 158), shorten(options[-1]))

    def page(path, *, title, description, image, data, h1="", jsonld=None, noindex=False, noscript=""):
        head_extra = []
        if noindex:
            head_extra.append('<meta name="robots" content="noindex">')
        if site.get("googleVerification"):
            head_extra.append(f'<meta name="google-site-verification" content="{esc(site["googleVerification"])}">')
        if jsonld:
            ld = json.dumps({"@context": "https://schema.org", "@graph": jsonld}, ensure_ascii=False, indent=1)
            ld = ld.replace("</", "<\\/")  # never close the <script> tag by accident
            head_extra.append('<script type="application/ld+json">\n' + ld + "\n</script>")
        head_extra_html = "\n  ".join(head_extra)
        h1_html = '<h1 class="sr-only">' + esc(h1) + "</h1>" if h1 else ""
        noscript_html = "<noscript>" + noscript + "</noscript>" if noscript else ""
        attrs = " ".join('data-%s="%s"' % (k, esc(v)) for k, v in data.items())
        canonical = abs_url(path)
        return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <link rel="canonical" href="{esc(canonical)}">
  <meta name="theme-color" content="#0b0b0b">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{esc(name)}">
  <meta property="og:url" content="{esc(canonical)}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:image" content="{esc(abs_url(image))}">
  <meta name="twitter:card" content="summary_large_image">
  {head_extra_html}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
  <script src="content.js"></script>
  <script>if (SITE.theme) document.documentElement.dataset.theme = SITE.theme;</script>
</head>
<body {attrs}>
  {h1_html}
  <main id="main"></main>
  {noscript_html}
  <script src="assets/site.js"></script>
</body>
</html>
"""

    def links(items):
        return "<ul>" + "".join(f'<li><a href="work/{esc(p["id"])}/">{esc(p["title"])}</a></li>' for p in items) + "</ul>"

    pages = {}  # path -> html
    sitemap = []

    # Home
    first_cover = projects[0]["cover"] if projects else site.get("photo", "")
    pages["index.html"] = page(
        "", title=f"{name} | Director, DOP, Camera Operator & Editor",
        description=f"{name}, {jobs}{based}. Music videos, corporate films, events and short films.",
        image=first_cover, data={"page": "home", "category": ""},
        h1=f"{name} — {jobs}",
        jsonld=[{"@type": "WebSite", "@id": f"{url}/#website", "name": name, "url": f"{url}/"}, person],
        noscript=links(projects))
    sitemap.append("")

    # Category pages
    for cat in categories:
        cid, lab = cat["id"], cat["label"]
        items = [p for p in projects if p.get("category") == cid]
        if cid == "films":
            names = ", ".join(f["title"] for f in films[:4])
            desc = f"Short films photographed by {name}, director of photography{based}" + (f": {names}." if names else ".")
            image = films[0]["poster"] if films and films[0].get("poster") else first_cover
            title = f"Films | {name}, director of photography"
        else:
            names = ", ".join(p["title"] for p in items[:3])
            desc = f"{lab.capitalize()} by {name}, {jobs}{based}" + (f": {names}…" if names else ".")
            image = items[0]["cover"] if items else first_cover
            title = f"{lab.capitalize()} | {name}, director & DOP"
        pages[f"{cid}.html"] = page(
            f"{cid}.html", title=title, description=shorten(desc), image=image,
            data={"page": "category", "category": cid}, h1=f"{lab.capitalize()} — {name}",
            jsonld=[person], noscript=links(items))
        sitemap.append(f"{cid}.html")

    # About, contact, reel
    bio = (site.get("bio") or [site.get("about", "")])[0]
    pages["about.html"] = page(
        "about.html", title=f"About | {name}", description=shorten(bio),
        image=site.get("photo") or first_cover, data={"page": "about", "category": ""}, jsonld=[person])
    sitemap.append("about.html")
    pages["contact.html"] = page(
        "contact.html", title=f"Contact | {name}",
        description=shorten(f"Contact {name}, {jobs}{based}" + (f": {site['email']}." if site.get("email") else ".")),
        image=first_cover, data={"page": "contact", "category": ""}, jsonld=[person])
    sitemap.append("contact.html")
    pages["reel.html"] = page(
        "reel.html", title=f"Showreel | {name}", description=f"Showreel of {name}, {jobs}{based}.",
        image=first_cover, data={"page": "reel", "category": ""}, noindex=not site.get("reel"))
    if site.get("reel"):
        sitemap.append("reel.html")

    # Old project address (project.html?id=…) now forwards to /work/<id>/; 404 page
    pages["project.html"] = page(
        "project.html", title=name, description=f"{name}, {jobs}{based}.", image=first_cover,
        data={"page": "project", "category": ""}, noindex=True)
    pages["404.html"] = page(
        "404.html", title=f"Page not found | {name}", description=f"{name}, {jobs}{based}.",
        image=first_cover, data={"page": "notfound", "category": ""}, noindex=True)

    # One page per project
    for p in projects:
        path = f"work/{p['id']}/"
        title = p["title"] + (f" – {p['client']}" if p.get("client") else "") + f" | {name}"
        desc = project_desc(p)
        ld = [person]
        embed = embed_url(p.get("video"))
        if p.get("date") and embed:
            ld.append({
                "@type": "VideoObject",
                "name": p["title"] + (f" – {p['client']}" if p.get("client") else ""),
                "description": desc,
                "thumbnailUrl": [abs_url(p["cover"])],
                "uploadDate": p["date"],
                "embedUrl": embed,
                "url": abs_url(path),
                "contributor": {"@id": f"{url}/#person"},
            })
        pages[path + "index.html"] = page(
            path, title=title, description=desc, image=p["cover"],
            data={"page": "project", "category": "", "project": p["id"]}, jsonld=ld)
        sitemap.append(path)

    # Write everything; /work/ is rebuilt from scratch so removed projects disappear
    shutil.rmtree(os.path.join(ROOT, "work"), ignore_errors=True)
    for path, content in pages.items():
        full = os.path.join(ROOT, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            f.write(content)

    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for path in sitemap:
            f.write(f"  <url><loc>{esc(abs_url(path))}</loc><lastmod>{today}</lastmod></url>\n")
        f.write("</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {url}/sitemap.xml\n")

    print(f"Built {len(pages)} pages ({len(projects)} projects) + sitemap.xml ({len(sitemap)} addresses) + robots.txt")


if __name__ == "__main__":
    main()
