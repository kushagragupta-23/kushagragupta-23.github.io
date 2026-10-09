# Kushagra Gupta · Portfolio

An original, responsive portfolio for AI and Data Science, published at [kushagragupta-23.github.io](https://kushagragupta-23.github.io/).

Features eight project stories, six featured projects, a searchable archive of all 15 public repositories, experience, education, certifications, a grouped toolkit, light/dark themes, and a responsive neural-network illustration. Project illustrations are conceptual visuals, not product screenshots.

## Run locally

Requires Node.js 24. No npm dependencies or API keys are needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. For production:

```sh
npm run check
npm run build
npm run preview
```

## Update content

Edit `content.js` to change projects, experience, skills or contact details. GitHub and project links are static snapshots; no live GitHub API is required for the published site. Unavailable source/demo links are omitted. Private source documents stay outside the published build.

Design and copy live in `index.html`, `styles.css` and `app.js`. Local fonts and icons are in `assets/`. Keyboard navigation, native project dialogs and reduced-motion preferences are supported.

## Publishing

The GitHub Actions workflow validates and builds the site, then deploys `dist/` to GitHub Pages on a push to `main`. See [deployment details](docs/DEPLOYMENT.md).

Research of 18 portfolio references, including Emma Bostian’s directory, is documented in [RESEARCH.md](docs/RESEARCH.md). Project evidence and result limitations are recorded in [CONTENT-SOURCES.md](docs/CONTENT-SOURCES.md).
