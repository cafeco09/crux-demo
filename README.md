# CruX — GitHub Pages Demo

A static, client-side feature request MVP for X.

CruX is a proposed interaction layer for high-signal X posts:

```text
50 likes unlock CruX
15 people open the room
5 days reveal the crux
```

This version is designed to run on **GitHub Pages**. It has no backend, no API keys, no login and no database. The demo state runs in the browser.

## Files

```text
index.html
style.css
app.js
.nojekyll
```

## Local preview

Open `index.html` directly in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Launch CruX GitHub Pages demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crux-demo.git
git push -u origin main
```

Then on GitHub:

1. Open your repository.
2. Go to **Settings**.
3. Go to **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save.

Your site will be available at:

```text
https://YOUR_USERNAME.github.io/crux-demo/
```

## Note

This is a prototype concept and is not affiliated with X.
