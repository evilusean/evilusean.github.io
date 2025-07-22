// main.js
function updateCombinedAndUrl() {
  const preamble = document.getElementById('preamble').value;
  const search = document.getElementById('search').value;
  const combined = preamble + (preamble && search ? '\n' : '') + search;
  document.getElementById('combined').value = combined;

  // Encode for URL
  const params = new URLSearchParams();
  if (preamble) params.set('preamble', preamble);
  if (search) params.set('search', search);
  const url = window.location.origin + window.location.pathname + '?' + params.toString();
  document.getElementById('urlOutput').value = url;
}

document.getElementById('preamble').addEventListener('input', updateCombinedAndUrl);
document.getElementById('search').addEventListener('input', updateCombinedAndUrl);

document.getElementById('copyCombined').addEventListener('click', function() {
  const combined = document.getElementById('combined');
  combined.select();
  document.execCommand('copy');
});

document.getElementById('copyUrl').addEventListener('click', function() {
  const urlOutput = document.getElementById('urlOutput');
  urlOutput.select();
  document.execCommand('copy');
});

document.getElementById('searchGemini').addEventListener('click', function() {
  const combined = document.getElementById('combined').value;
  if (combined.trim()) {
    // Gemini search URL (using Google Gemini's public search interface)
    // If Gemini has a specific search URL, use it. Otherwise, use Google as a fallback.
    // Example Gemini URL (update if Gemini has a different endpoint):
    const geminiUrl = 'https://gemini.google.com/app?query=' + encodeURIComponent(combined);
    window.open(geminiUrl, '_blank');
  }
});

// On load, populate from URL if present
window.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('preamble')) {
    document.getElementById('preamble').value = params.get('preamble');
  }
  if (params.has('search')) {
    document.getElementById('search').value = params.get('search');
  }
  updateCombinedAndUrl();
});
