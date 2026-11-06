# Password Gate

A simple password page: enter a password, get redirected to a link. Deployed on
Vercel, with attempts optionally logged to a Google Sheet.

## Folder structure

```
password-gate/
├── index.html              the login page
├── assets/
│   └── style.css           styling
├── src/
│   └── app.js               client-side logic (calls /api/verify)
├── api/
│   └── verify.js            serverless function — checks the password
├── apps-script-webhook/
│   └── Code.gs               separate Apps Script that logs attempts to a Sheet
└── package.json
```

Note: Vercel only auto-detects serverless functions inside an `/api` folder at
the project root, so `verify.js` has to live there rather than under `src/`.
`src/` holds the browser-side script and `assets/` holds the CSS, as requested.

The password, target link, and log webhook URL are all hardcoded as constants
at the top of `api/verify.js` — no environment variables needed. They still
never reach the browser: this file only runs on Vercel's server, so visitors
only ever see the result ('ok' or 'wrong'), never this file's contents.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Password gate"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. Deploy on Vercel

1. Go to vercel.com → **Add New Project** → import the GitHub repo.
2. Framework preset: **Other** (it's static + a serverless function, no build step needed).
3. Deploy — no environment variables are required.

## 3. Set up the Google Sheet log

Vercel can't run Google Apps Script's `SpreadsheetApp` directly, so logging
uses a small, separate Apps Script that just receives a result and writes it
to a Sheet:

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Replace the default code with everything in `apps-script-webhook/Code.gs`.
3. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Approve the permissions Google asks for, then copy the deployment URL
   (it ends in `/exec`).
5. Open `api/verify.js` and paste that URL as the value of `LOG_WEBHOOK_URL`
   at the top of the file.
6. Commit and push that change to GitHub — Vercel redeploys automatically.
7. Back in the Apps Script editor, select `showLogUrl` from the function
   dropdown and click **Run**. Check **View → Executions** (or **Logs**) for
   the link it prints — that opens your new "Password Attempts Log" sheet.

From then on, every attempt (correct or wrong) appears as a new row with the
time, result, what was typed, visitor ID, and browser.

## Changing the password or link later

Open `api/verify.js`, edit the `PASSWORD` or `TARGET_URL` constants at the
top, then commit and push — Vercel redeploys automatically.
