// /api/verify.js
// Runs on Vercel's server, so this file's contents are never sent to the
// browser — visitors can only ever see the result ('ok' or 'wrong'), never
// this source code or the values below.

const PASSWORD = 'Taskirmaz0826';                 // the password visitors must type
const TARGET_URL = 'https://myfavoritecoffee.s.gy/EnglishLearningProject';       // where correct visitors are sent
const LOG_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxSFj9nicrHRZviELLg87Gk1nlsicbXaMv-MSCG-BTAuNzqruC8ghHrI7eCToWQt01kvg/exec';                        // paste your Apps Script /exec URL here once you have it

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { password = '', vid = 'unknown', browser = 'unknown' } = req.body || {};
  const pw = String(password).trim().slice(0, 200);
  const ua = String(browser).slice(0, 300);

  const isCorrect = pw === PASSWORD;

  // Log to the Google Sheet via the Apps Script webhook.
  // Must be AWAITED: Vercel freezes the function as soon as the response is
  // sent, so a fire-and-forget fetch usually never reaches Google.
  // The 5s timeout + catch mean a logging failure never breaks the login.
  if (LOG_WEBHOOK_URL) {
    try {
      const r = await fetch(LOG_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: isCorrect ? 'CORRECT' : 'WRONG',
          text: pw,
          vid: String(vid).slice(0, 40),
          browser: ua
        }),
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      });
      console.log('Webhook response:', r.status, await r.text());
    } catch (err) {
      console.error('Webhook failed:', err);
    }
  } else {
    console.warn('LOG_WEBHOOK_URL is empty — nothing will be logged.');
  }

  if (isCorrect) {
    return res.status(200).json({ status: 'ok', url: TARGET_URL });
  }
  return res.status(200).json({ status: 'wrong' });
}
