# Resumify

A lightweight, JSON-driven resume website. Edit `resume-data.json` to update content — no build step required.

Built with plain HTML, CSS, and JavaScript so it deploys directly to GitHub Pages with zero tooling.

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Markup | HTML | GitHub Pages serves static files natively |
| Styling | CSS | Print and mobile layouts without a bundler |
| Data | JSON + vanilla JS | Easy to edit, no compile step |
| Fonts | Google Fonts (Carlito) | Calibri-like typography, loaded via CDN |
| Deploy | GitHub Actions | Push to `main` → live site |

No Node, npm, or build pipeline needed.

## Local preview

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Updating content

Edit `resume-data.json` and refresh the page.

Sections:
- `personal` — name, contact info, LinkedIn
- `summary` — professional summary
- `experience` — jobs with highlights
- `education` — degrees and details
- `projects` — projects and achievements
- `skills` — categorized skill rows

## Print to PDF

Click **Print to PDF**, then choose "Save as PDF" in the print dialog. Layout is optimized for A4.

## Deploy to GitHub Pages

### 1. Create the repo

```bash
git init
git add .
git commit -m "Initial commit: JSON-driven resume site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resumify.git
git push -u origin main
```

### 2. Enable GitHub Pages

In your repo on GitHub:

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` deploys automatically

Your site will be live at:

```
https://YOUR_USERNAME.github.io/resumify/
```

### Custom domain (optional)

Add your domain under **Settings → Pages → Custom domain**. No code changes needed.

## Project structure

```
resumify/
├── resume-data.json      # All resume content
├── index.html
├── css/style.css
├── js/app.js
├── .nojekyll             # Skip Jekyll processing on GitHub Pages
└── .github/workflows/deploy.yml
```
