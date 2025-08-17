# LoanView

A lightweight single-page app to explore loan offerings, compare loan types, calculate EMI, submit a detailed application, and generate a PDF report.

## Preview locally

```bash
python3 -m http.server 8000 --directory .
# Open http://localhost:8000
```

## Structure

- `index.html` — App shell with routes
- `styles.css` — Dark UI theme
- `app.js` — SPA routing, data, EMI calculator, localStorage, PDF export

## Export as ZIP

From workspace root:
```bash
zip -r loanview.zip loanview
```

## Publish to GitHub

Use GitHub CLI (gh):
```bash
cd loanview
# one-time: authenticate (uses browser)
gh auth login
# create a repo under your account and push
gh repo create loanview --private --source=. --remote=origin --push -y
```

If you prefer HTTPS with a Personal Access Token, set `GH_TOKEN` or use standard `git remote` with your token.