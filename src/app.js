const $ = id => document.getElementById(id);

// Visitor ID: random per browser, sent along so the log sheet can tell attempts apart.
// It identifies nothing about the person; it's just a random label.
let vid = localStorage.getItem('vid');
if (!vid) {
  vid = 'V-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  try { localStorage.setItem('vid', vid); } catch (e) {}
}

async function submit() {
  const pw = $('pw').value;
  if (!pw.trim()) { $('msg').textContent = 'Please enter the password.'; return; }

  $('btn').disabled = true;
  $('msg').textContent = '';

  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, vid, browser: navigator.userAgent })
    });
    const data = await res.json();

    if (data.status === 'ok') {
      $('viewPw').classList.add('hide');
      $('viewOk').classList.remove('hide');
      $('lnk').href = data.url;
      $('lnk').textContent = data.url;
    } else {
      $('pw').value = '';
      $('msg').textContent = 'Please try again.';
    }
  } catch (e) {
    $('msg').textContent = 'Something went wrong. Please try again.';
  } finally {
    $('btn').disabled = false;
  }
}

$('btn').addEventListener('click', submit);
$('pw').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
