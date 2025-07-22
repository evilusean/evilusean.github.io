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
