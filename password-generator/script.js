/*
 * Password Generator
 * Full client-side password generation with strength meter and history
 */

(function () {
  'use strict';

  const dom = {};

  function cacheDom() {
    dom.passwordOutput = document.getElementById('passwordOutput');
    dom.copyBtn = document.getElementById('copyBtn');
    dom.generateBtn = document.getElementById('generateBtn');
    dom.lengthSlider = document.getElementById('lengthSlider');
    dom.lengthValue = document.getElementById('lengthValue');
    dom.strengthBar = document.getElementById('strengthBar');
    dom.strengthLabel = document.getElementById('strengthLabel');
    dom.historyList = document.getElementById('historyList');
    dom.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    dom.toast = document.getElementById('toast');
    dom.toastMessage = document.getElementById('toastMessage');
    dom.chkUpper = document.getElementById('chkUpper');
    dom.chkLower = document.getElementById('chkLower');
    dom.chkNumbers = document.getElementById('chkNumbers');
    dom.chkSymbols = document.getElementById('chkSymbols');
    dom.chkExcludeSimilar = document.getElementById('chkExcludeSimilar');
    dom.chkExcludeDuplicate = document.getElementById('chkExcludeDuplicate');
  }

  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
  };

  const SIMILAR = new Set(['i', 'l', '1', 'L', 'o', '0', 'O']);

  let history = [];
  const HISTORY_KEY = 'pwgen_history';
  const MAX_HISTORY = 10;

  const STRENGTH = {
    levels: ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'],
    colors: ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6'],
  };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    loadHistory();
    bindEvents();
    generatePassword();
  });

  function bindEvents() {
    dom.generateBtn.addEventListener('click', generatePassword);
    dom.lengthSlider.addEventListener('input', onLengthChange);
    dom.copyBtn.addEventListener('click', copyPassword);
    dom.clearHistoryBtn.addEventListener('click', clearHistory);

    document.querySelectorAll('.checkbox-label input').forEach((cb) => {
      cb.addEventListener('change', ensureOneChecked);
    });
  }

  function onLengthChange() {
    dom.lengthValue.textContent = dom.lengthSlider.value;
    generatePassword();
  }

  function ensureOneChecked() {
    const checked = getSelectedTypes();
    if (checked.length === 0) {
      this.checked = true;
    }
  }

  function getSelectedTypes() {
    const types = [];
    if (dom.chkUpper.checked) types.push('upper');
    if (dom.chkLower.checked) types.push('lower');
    if (dom.chkNumbers.checked) types.push('numbers');
    if (dom.chkSymbols.checked) types.push('symbols');
    return types;
  }

  function buildCharPool(types) {
    let pool = '';
    types.forEach((t) => { pool += CHARS[t]; });

    if (dom.chkExcludeSimilar.checked) {
      pool = [...pool].filter((c) => !SIMILAR.has(c)).join('');
    }

    return pool;
  }

  function generatePassword() {
    const types = getSelectedTypes();
    if (types.length === 0) return;

    const length = parseInt(dom.lengthSlider.value, 10);
    const pool = buildCharPool(types);
    const excludeDup = dom.chkExcludeDuplicate.checked;

    if (pool.length === 0) {
      dom.passwordOutput.textContent = 'No chars available';
      return;
    }

    if (excludeDup && length > pool.length) {
      dom.passwordOutput.textContent = 'Not enough unique chars';
      return;
    }

    const required = [];
    types.forEach((t) => {
      let chars = CHARS[t];
      if (dom.chkExcludeSimilar.checked) {
        chars = [...chars].filter((c) => !SIMILAR.has(c)).join('');
      }
      required.push(chars[Math.floor(Math.random() * chars.length)]);
    });

    let available = pool;
    if (excludeDup) {
      available = [...pool].filter((c) => !required.includes(c)).join('');
    }

    const remaining = [];
    for (let i = 0; i < length - required.length; i++) {
      if (available.length === 0) break;

      let idx = Math.floor(Math.random() * available.length);
      let char = available[idx];

      if (excludeDup) {
        available = available.replace(char, '');
      }

      remaining.push(char);
    }

    let combined = required.concat(remaining);
    combined = shuffleArray(combined);
    const password = combined.join('');

    dom.passwordOutput.textContent = password;
    updateStrength(password, types.length);
    copyIconReset();

    addToHistory(password);
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateStrength(password, typeCount) {
    const len = password.length;
    let score = 0;

    if (len >= 8) score++;
    if (len >= 10) score++;
    if (len >= 14) score++;
    if (len >= 20) score++;

    if (len < 8 || typeCount <= 1) {
      score = 0;
    } else if (len >= 8 && typeCount >= 2) {
      score = Math.max(score, 1);
    }

    if (len >= 10 && typeCount >= 2) score = Math.max(score, 2);
    if (len >= 12 && typeCount >= 3) score = Math.max(score, 3);
    if (len >= 16 && typeCount >= 3) score = Math.max(score, 4);

    const hasExcludes = dom.chkExcludeSimilar.checked || dom.chkExcludeDuplicate.checked;

    if (len >= 20 && typeCount >= 4 && hasExcludes) {
      score = 4;
    }

    score = Math.min(score, 4);
    score = Math.max(score, 0);

    const pct = ((score + 1) / 5) * 100;
    dom.strengthBar.style.width = pct + '%';
    dom.strengthBar.style.background = STRENGTH.colors[score];
    dom.strengthLabel.textContent = STRENGTH.levels[score];
  }

  function copyPassword() {
    const text = dom.passwordOutput.textContent;
    if (!text || text === 'Click Generate' || text === 'No chars available' || text === 'Not enough unique chars') return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (e) {
      void e;
    }
    document.body.removeChild(ta);
  }

  let copyTimer = null;

  function showCopyFeedback() {
    dom.copyBtn.classList.add('copied');
    dom.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    showToast('Copied to clipboard!');

    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyIconReset();
    }, 2000);
  }

  function copyIconReset() {
    dom.copyBtn.classList.remove('copied');
    dom.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  }

  function showToast(message) {
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2500);
  }

  function addToHistory(password) {
    if (!password || password.length === 0) return;
    history = history.filter((p) => p !== password);
    history.unshift(password);
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }
    saveHistory();
    renderHistory();
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      void e;
    }
  }

  function loadHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) {
        history = JSON.parse(data);
        if (!Array.isArray(history)) history = [];
      }
    } catch (e) {
      history = [];
    }
    renderHistory();
  }

  function renderHistory() {
    dom.historyList.innerHTML = '';

    if (history.length === 0) {
      const li = document.createElement('li');
      li.className = 'history-empty';
      li.textContent = 'No passwords generated yet';
      dom.historyList.appendChild(li);
      return;
    }

    history.forEach((pwd) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const span = document.createElement('span');
      span.className = 'password-text';
      span.textContent = pwd;

      const btn = document.createElement('button');
      btn.className = 'icon-btn';
      btn.setAttribute('aria-label', 'Copy password');
      btn.title = 'Copy to clipboard';
      btn.innerHTML = '<i class=\"fas fa-copy\"></i>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyHistoryPassword(pwd, btn);
      });

      li.appendChild(span);
      li.appendChild(btn);
      dom.historyList.appendChild(li);
    });
  }

  function copyHistoryPassword(pwd, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pwd).then(() => {
        btn.innerHTML = '<i class=\"fas fa-check\"></i>';
        btn.classList.add('copied');
        showToast('Copied to clipboard!');
        setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i>';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        fallbackCopyHistory(pwd, btn);
      });
    } else {
      fallbackCopyHistory(pwd, btn);
    }
  }

  function fallbackCopyHistory(pwd, btn) {
    const ta = document.createElement('textarea');
    ta.value = pwd;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.classList.add('copied');
      showToast('Copied to clipboard!');
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-copy"></i>';
        btn.classList.remove('copied');
      }, 2000);
    } catch (e) {
      void e;
    }
    document.body.removeChild(ta);
  }

  function clearHistory() {
    history = [];
    saveHistory();
    renderHistory();
    showToast('History cleared');
  }
})();
