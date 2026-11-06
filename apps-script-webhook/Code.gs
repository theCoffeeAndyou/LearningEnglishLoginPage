/**
 * Deploy this file SEPARATELY as its own Google Apps Script Web App.
 * It has no knowledge of the real password — it only receives a result
 * ('CORRECT' / 'WRONG') from the Vercel function and logs it to a Sheet.
 *
 * Setup:
 * 1. Go to script.google.com -> New project -> paste this in as Code.gs
 * 2. Deploy -> New deployment -> type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 3. Copy the deployment URL (ends in /exec) and paste it as the value of
 *    LOG_WEBHOOK_URL at the top of api/verify.js, then redeploy on Vercel
 */

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sh = getSheet_();
    sh.appendRow([
      new Date(),
      body.result || '',
      "'" + (body.text || ''),
      String(body.vid || 'unknown').slice(0, 40),
      String(body.browser || 'unknown').slice(0, 300)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('LOG_SHEET_ID');
  if (id) return SpreadsheetApp.openById(id).getSheets()[0];

  const ss = SpreadsheetApp.create('Password Attempts Log');
  props.setProperty('LOG_SHEET_ID', ss.getId());
  const sh = ss.getSheets()[0];
  sh.appendRow(['Time', 'Result', 'What was typed', 'Visitor ID', 'Browser']);
  return sh;
}

/** Run once from the editor, then check the Execution log for the sheet link. */
function showLogUrl() {
  getSheet_();
  const id = PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID');
  Logger.log('https://docs.google.com/spreadsheets/d/' + id);
}
