(function () {
  'use strict';

  // ─── DOM refs ───────────────────────────────────────────────
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const buttonsEl = document.getElementById('buttons');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const historyToggle = document.getElementById('historyToggle');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const overlay = document.getElementById('overlay');

  // ─── State ──────────────────────────────────────────────────
  let currentInput = '0';
  let expression = '';
  let result = null;
  let justEvaluated = false;
  let memory = 0;
  let history = [];

  // ─── Display ────────────────────────────────────────────────
  function formatNumber(num) {
    if (num === Infinity || num === -Infinity || isNaN(num)) {
      return String(num);
    }
    const parts = String(num).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function updateDisplay() {
    const displayVal = currentInput === '' ? '0' : currentInput;
    resultEl.textContent = formatNumber(displayVal);
    resultEl.classList.toggle('small', displayVal.replace(/,/g, '').length > 12);
    expressionEl.textContent = expression;
  }

  // ─── Input helpers ──────────────────────────────────────────
  function appendNumber(val) {
    if (justEvaluated) {
      currentInput = val === '.' ? '0.' : val;
      expression = '';
      justEvaluated = false;
    } else {
      if (val === '.' && currentInput.includes('.')) return;
      if (currentInput === '0' && val !== '.') {
        currentInput = val;
      } else {
        currentInput += val;
      }
    }
    updateDisplay();
  }

  function appendOperator(op) {
    justEvaluated = false;
    if (currentInput === '' && expression === '') return;
    let opDisplay = op;
    let opValue = op;
    if (op === '×') { opDisplay = '×'; opValue = '*'; }
    if (op === '÷') { opDisplay = '÷'; opValue = '/'; }

    if (currentInput !== '') {
      expression += currentInput + ' ' + opDisplay + ' ';
      currentInput = '';
    } else {
      const parts = expression.trim().split(/\s+/);
      if (parts.length >= 1) {
        expression = parts.slice(0, -1).join(' ') + ' ' + opDisplay + ' ';
      }
    }
    updateDisplay();
  }

  function appendFunction(fn) {
    justEvaluated = false;
    const current = currentInput || '0';
    let val = parseFloat(current.replace(/,/g, ''));
    let input;

    switch (fn) {
      case 'sin':  input = Math.sin(val); break;
      case 'cos':  input = Math.cos(val); break;
      case 'tan':  input = Math.tan(val); break;
      case 'log':  input = Math.log10(val); break;
      case 'ln':   input = Math.log(val); break;
      case 'sqrt': input = Math.sqrt(val); break;
      case 'factorial':
        input = factorial(val);
        break;
      case 'reciprocal':
        input = val !== 0 ? 1 / val : 'Error';
        break;
      case 'abs':
        input = Math.abs(val);
        break;
      case 'x-squared':
        input = val * val;
        break;
      case 'x-cubed':
        input = val * val * val;
        break;
      case 'exp':
        input = Math.exp(val);
        break;
      case 'pi':
        input = Math.PI;
        break;
      case 'euler':
        input = Math.E;
        break;
      case 'percent':
        input = val / 100;
        break;
      case 'pow':
        expression += current + ' ^ ';
        currentInput = '';
        updateDisplay();
        return;
      default:
        return;
    }

    if (input === 'Error' || (typeof input === 'number' && !isFinite(input))) {
      currentInput = 'Error';
      result = null;
      updateDisplay();
      return;
    }

    if (!Number.isInteger(input)) {
      input = parseFloat(input.toFixed(10));
    }
    currentInput = String(input);
    updateDisplay();
  }

  function factorial(n) {
    if (n < 0) return 'Error';
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) return gamma(n + 1);
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  function gamma(n) {
    if (n < 0.5) {
      return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
    }
    n -= 1;
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (n + i);
    const t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
  }

  function appendParen(p) {
    justEvaluated = false;
    if (p === '(') {
      expression += '(';
    } else {
      if (currentInput !== '') {
        expression += currentInput + ')';
        currentInput = '';
      } else {
        expression += ')';
      }
    }
    updateDisplay();
  }

  // ─── Evaluation ─────────────────────────────────────────────
  function evaluate() {
    if (currentInput !== '') {
      expression += currentInput;
    }

    let expr = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/π/g, String(Math.PI))
      .replace(/\be\b(?!x?p)/g, String(Math.E));

    const sanitized = expr.replace(/[^0-9+\-*/.()%\s,e]/g, '');

    if (!sanitized.trim()) {
      updateDisplay();
      return;
    }

    try {
      const fn = new Function('return (' + sanitized + ')');
      const val = fn();
      if (typeof val !== 'number' || !isFinite(val)) {
        currentInput = 'Error';
        result = null;
      } else {
        const display = !Number.isInteger(val) ? parseFloat(val.toFixed(10)) : val;
        currentInput = String(display);
        result = display;
        addHistory(expression, currentInput);
      }
    } catch (_e) {
      currentInput = 'Error';
      result = null;
    }
    justEvaluated = true;
    updateDisplay();
  }

  // ─── History ────────────────────────────────────────────────
  function addHistory(expr, res) {
    history.push({ expression: expr, result: res });
    if (history.length > 100) history.shift();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<li class="history-empty">No calculations yet</li>';
      return;
    }
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      const li = document.createElement('li');
      li.innerHTML = `<div class="history-expr">${item.expression}</div>
                      <div class="history-result">= ${item.result}</div>`;
      historyList.appendChild(li);
    }
  }

  function toggleHistory() {
    const open = historyPanel.classList.toggle('open');
    overlay.classList.toggle('active', open);
  }

  // ─── Memory ─────────────────────────────────────────────────
  function memoryAction(action) {
    const current = parseFloat(currentInput.replace(/,/g, '')) || 0;
    switch (action) {
      case 'mc': memory = 0; break;
      case 'mr':
        currentInput = String(memory);
        justEvaluated = true;
        break;
      case 'm-plus': memory += current; break;
      case 'm-minus': memory -= current; break;
    }
    updateDisplay();
  }

  // ─── Clear ──────────────────────────────────────────────────
  function clearAll() {
    currentInput = '0';
    expression = '';
    result = null;
    justEvaluated = false;
    updateDisplay();
  }

  function clearEntry() {
    currentInput = '0';
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated) {
      clearAll();
      return;
    }
    if (currentInput.length <= 1) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  // ─── Button click handler ───────────────────────────────────
  buttonsEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (value !== undefined) {
      appendNumber(value);
      return;
    }

    switch (action) {
      case 'add':        appendOperator('+'); break;
      case 'subtract':   appendOperator('-'); break;
      case 'multiply':   appendOperator('×'); break;
      case 'divide':     appendOperator('÷'); break;
      case 'equals':     evaluate(); break;
      case 'percent':    appendFunction('percent'); break;

      case 'sin': case 'cos': case 'tan':
      case 'log': case 'ln': case 'sqrt':
      case 'factorial': case 'reciprocal': case 'abs':
      case 'x-squared': case 'x-cubed': case 'exp':
      case 'pi': case 'euler':
        appendFunction(action);
        break;

      case 'pow':
        appendFunction('pow');
        break;

      case 'paren-open':
      case 'paren-close':
        appendParen(action === 'paren-open' ? '(' : ')');
        break;

      case 'clear':       clearAll(); break;
      case 'clear-entry': clearEntry(); break;
      case 'backspace':   backspace(); break;

      case 'mc': case 'mr': case 'm-plus': case 'm-minus':
        memoryAction(action);
        break;

      default:
        break;
    }
  });

  // ─── Keyboard support ───────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;

    if (key >= '0' && key <= '9') {
      e.preventDefault();
      appendNumber(key);
      return;
    }

    switch (key) {
      case '.': e.preventDefault(); appendNumber('.'); break;
      case '+': e.preventDefault(); appendOperator('+'); break;
      case '-': e.preventDefault(); appendOperator('-'); break;
      case '*': e.preventDefault(); appendOperator('×'); break;
      case '/': e.preventDefault(); appendOperator('÷'); break;
      case 'Enter':
      case '=': e.preventDefault(); evaluate(); break;
      case 'Backspace': e.preventDefault(); backspace(); break;
      case 'Delete': e.preventDefault(); clearEntry(); break;
      case 'Escape': e.preventDefault(); clearAll(); break;
      case '(': e.preventDefault(); appendParen('('); break;
      case ')': e.preventDefault(); appendParen(')'); break;
      case '%': e.preventDefault(); appendFunction('percent'); break;
      default: break;
    }
  });

  // ─── History toggle ─────────────────────────────────────────
  historyToggle.addEventListener('click', toggleHistory);
  overlay.addEventListener('click', function () {
    historyPanel.classList.remove('open');
    overlay.classList.remove('active');
  });

  clearHistoryBtn.addEventListener('click', function () {
    history = [];
    renderHistory();
  });

  // ─── Init ───────────────────────────────────────────────────
  updateDisplay();
  renderHistory();

})();
