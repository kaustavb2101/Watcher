/**
 * TMLI Render Utilities
 * Shared formatting and UI helper functions.
 * Also exports global shorthand wrappers used across app-logic.js and render-engine.js.
 */

window.RU = {
  esc: (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
  
  fmtNum: (str) => {
    if (str === undefined || str === null) return '—';
    let s = String(str);
    return s.replace(/\d+/g, match => {
      const num = parseInt(match, 10);
      if (isNaN(num) || num < 1000 || (num >= 2000 && num <= 2100)) return match;
      if (num >= 1000000) return (num/1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      return num.toLocaleString();
    });
  },

  scoreColor: (s) => s > 0 ? '#1A6B3C' : s < -60 ? '#8B1D2F' : s < -20 ? '#B84C1A' : '#B8943A',
  barClass: (s) => s > 0 ? 'bf-pos' : s < -60 ? 'bf-neg' : s < -20 ? 'bf-warn' : 'bf-neu',
  riskClass: (r) => ({ 'Critical': 'rk-crit', 'High': 'rk-hi', 'Medium': 'rk-med', 'Low': 'rk-lo', 'Positive': 'rk-pos' }[r] || 'rk-med'),
  sign: (n) => (n > 0 ? '+' : ''),
  pct: (n) => Math.min(Math.abs(n), 100),

  verifiedBadge: (source = 'Institutional Data') => `
    <div class="verified-badge" title="Grounded in real-time ${source}">
      <span class="v-icon">✓</span> VERIFIED: ${source.toUpperCase()}
    </div>
  `,

  /**
   * Simple XSS Sanitizer for production-grade security
   */
  safeHTML: (str) => {
      if (!str) return '';
      // Basic sanitization: allow only certain tags if needed, otherwise escape
      // For this project, we'll use RU.esc for all dynamic user/AI text
      return window.RU.esc(str);
  }
};

// ── Global Shorthand Aliases ────────────────────────────────────────────────
// Used throughout app-logic.js and render-engine.js without the RU. prefix.
// These must be available before those scripts execute.
window.esc          = (...a) => window.RU.esc(...a);
window.fmtNum       = (...a) => window.RU.fmtNum(...a);
window.scoreColor   = (...a) => window.RU.scoreColor(...a);
window.sign         = (...a) => window.RU.sign(...a);
window.verifiedBadge = (...a) => window.RU.verifiedBadge(...a);

// ── Toast Notification System ─────────────────────────────────────────────
window.showToast = function(msg, type = 'ok') {
  const toast = document.getElementById('toast');
  const ic    = document.getElementById('toastIc');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;
  if (ic)    ic.textContent  = type === 'ok' ? '✓' : '⚠';
  if (msgEl) msgEl.textContent = msg;
  toast.className = 'show ' + (type === 'error' ? 'toast-error' : 'toast-ok');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.className = ''; }, 4000);
};

// ── Error State Handler ──────────────────────────────────────────────────────
window.showError = function(err) {
  console.error('TMLI Analysis Error:', err);
  const msg  = document.getElementById('errorMsg');
  const det  = document.getElementById('errorDetail');
  if (msg) msg.textContent = 'Analysis Engine Failure';
  if (det) det.textContent = err?.message || String(err);
  if (window.hide) window.hide('emptyState', 'loadState', 'results');
  if (window.show) window.show('errorState');
  window.showToast('Analysis failed — check AI configuration.', 'error');
};

// ── Retry Last Analysis ──────────────────────────────────────────────────────
window.retryLast = function() {
  if (window.S && window.S.lastTag) {
    if (window.hide) window.hide('errorState');
    runAnalysis(window.S.lastTag, window.S.lastTitle, window.S.lastCtx, null);
  } else {
    window.showHome();
  }
};
