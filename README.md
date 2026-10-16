# Site de Maxime Baldewyns

Site statique (HTML/CSS/JS), sans base de données ni abonnement.

## Modifier le contenu

**Tout se modifie dans un seul fichier : `content.js`.**

- `SITE` : nom, titres, e-mail, téléphone, lien du showreel, réseaux sociaux, texte de présentation.
  - `theme: "dark"` = fond noir, `theme: "light"` = fond blanc (tout le site change d'un coup).
- `PROJECTS` : la liste des projets, dans l'ordre d'affichage sur la page d'accueil.

### Ajouter un projet

1. Mets l'image de couverture dans le dossier `images/` (format 16:9, 1920 px de large, en JPG).
2. Dans `content.js`, copie un bloc `{ ... },` existant et adapte-le :

```js
{
  id: "nike-run",                       // court, minuscules, sans espaces
  title: "Run Free",
  client: "Nike",
  category: "corporate",                // music-videos | corporate | events | films
  role: "Director & DOP",
  video: "https://vimeo.com/123456789", // lien Vimeo ou YouTube
  cover: "images/nike-run.jpg",
  credits: ["Production: XYZ", "Agency: ABC"],
  stills: ["images/nike-run-1.jpg"]     // facultatif
},
```

### Mise en page de l'accueil (automatique)

La mise en page dépend uniquement de **l'ordre des projets** dans `content.js`, comme sur le site d'Adolpho Veloso :

```
[        1 (toute la ligne)        ]
[      2 grande       |     3      ]
[                     |     4      ]
[     5      |      7 grande       ]
[     6      |                     ]
[      8 grande       |     9      ]   ...
```

- Le **1er projet** prend toute la ligne.
- Ensuite, par **blocs de trois** : une grande vignette (2/3 de la largeur) et deux petites empilées (1/3), avec la grande alternativement à gauche puis à droite.
- Les **grandes vignettes** sont les projets n° 2, 7, 8, 13, 14… Mets-y tes images les plus nettes.
- S'il reste deux projets à la fin, ils se partagent la ligne. S'il en reste un seul, il prend toute la ligne.
- Sur mobile, tous les projets s'affichent les uns sous les autres.

### Affiches de films (page « films »)

Les affiches sont listées dans `FILMS`, à la fin de `content.js`. Elles n'apparaissent **que sur la page films**, jamais sur l'accueil. Pour en ajouter une, mets l'affiche dans `images/films/` et copie un bloc :

```js
{
  title: "Titre du film",
  year: 2025,
  director: "Nom du réalisateur",
  role: "Director of Photography",
  poster: "images/films/titre-du-film.jpg",   // "" = carte avec le titre si pas d'affiche
  link: "https://www.imdb.com/title/tt0000000/"
},
```

### Extrait vidéo au survol

Sur ordinateur, la vidéo se lance sans le son quand la souris passe sur la couverture. Sur mobile, seule l'image s'affiche.

**Par défaut, c'est la vidéo YouTube du projet qui joue.** Réglages possibles dans le bloc du projet :
- `previewStart: 42,` : seconde à laquelle l'aperçu démarre
- `previewZoom: 1.4,` : agrandissement de l'aperçu (1.4 masque les bandes noires d'une vidéo cinémascope)

Limite de YouTube : au tout premier survol, l'aperçu met environ 3 à 4 secondes à apparaître, le temps que le bouton pause imposé par YouTube disparaisse. Les survols suivants sont immédiats.

**Pour un aperçu instantané dès le premier survol**, utilise un extrait MP4 :

1. Exporte un extrait depuis ton montage :
   - **6 à 10 secondes**, un passage qui boucle bien
   - **MP4 / H.264**, **1920 × 1080** (ou 1280 × 720), **sans piste audio**
   - débit d'environ **4 Mbit/s**, soit **3 à 5 Mo** pour l'extrait
2. Mets-le dans le dossier `videos/`, par exemple `videos/nike-run.mp4`.
3. Ajoute la ligne `preview: "videos/nike-run.mp4",` dans le bloc du projet. L'extrait remplace alors la vidéo YouTube au survol.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | tous les projets |
| `music-videos.html`, `corporate.html`, `events.html`, `films.html` | projets filtrés par catégorie |
| `project.html?id=...` | page d'un projet (vidéo, crédits, photogrammes) |
| `reel.html` | showreel |
| `contact.html` | présentation et contact |

## Voir le site en local

Le site doit être servi par un petit serveur (ouvrir `index.html` en double-cliquant ne charge pas les projets dans tous les navigateurs) :

```bash
cd "/Volumes/LaCie/Site Web" && python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000

## Mettre en ligne

Glisser le dossier sur https://app.netlify.com/drop (gratuit), puis y relier ton nom de domaine.
