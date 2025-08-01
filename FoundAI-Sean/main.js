// main.js

// Updates the combined output and the bookmarkable URL in real time
function updateCombinedAndUrl() {
  // Get the values from the preamble and search textareas
  const preamble = document.getElementById('preamble').value;
  const search = document.getElementById('search').value;

  // Combine preamble and search, separated by a newline if both are present
  const combined = preamble + (preamble && search ? '\n' : '') + search;
  document.getElementById('combined').value = combined;

  // Create URL parameters for preamble and search
  const params = new URLSearchParams();
  if (preamble) params.set('preamble', preamble);
  if (search) params.set('search', search);

  // Construct the full URL with parameters for bookmarking/sharing
  const url = window.location.origin + window.location.pathname + '?' + params.toString();
  document.getElementById('urlOutput').value = url;
}

// Listen for input changes in the preamble and search fields to update outputs in real time
// This ensures the combined output and URL are always up to date
// (No need to listen for changes on the combined or URL fields, as they are readonly)
document.getElementById('preamble').addEventListener('input', updateCombinedAndUrl);
document.getElementById('search').addEventListener('input', updateCombinedAndUrl);

// Copy the combined output to the clipboard when the user clicks the 'Copy Combined' button
document.getElementById('copyCombined').addEventListener('click', function() {
  const combined = document.getElementById('combined');
  combined.select();
  document.execCommand('copy');
});

// Copy the bookmarkable URL to the clipboard when the user clicks the 'Copy URL' button
document.getElementById('copyUrl').addEventListener('click', function() {
  const urlOutput = document.getElementById('urlOutput');
  urlOutput.select();
  document.execCommand('copy');
});

// When the user clicks the 'Copy and GeminAI' button:
// 1. Copy the combined query to the clipboard
// 2. Open Gemini in a new tab
// 3. Alert the user to paste the query into Gemini (since Gemini does not support pre-filling via URL)
document.getElementById('searchGemini').addEventListener('click', function() {
  const combined = document.getElementById('combined');
  if (combined.value.trim()) {
    // Select and copy using execCommand for better compatibility
    combined.select();
    document.execCommand('copy');
    // Open Gemini in a new tab
    window.open('https://gemini.google.com/app', '_blank');
    // Removed alert for a smoother experience
  }
});

// On page load, check if the URL has preamble or search parameters
// If so, populate the corresponding fields and update the combined output and URL
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

// Help modal functionality
// Show the help modal when the Help button is clicked
document.getElementById('helpBtn').addEventListener('click', function() {
  document.getElementById('helpModal').style.display = 'flex';
});
// Hide the help modal when the close button is clicked
document.getElementById('closeHelp').addEventListener('click', function() {
  document.getElementById('helpModal').style.display = 'none';
});
// Hide the help modal when clicking outside the modal content
document.getElementById('helpModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});
