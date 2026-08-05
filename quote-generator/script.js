/* ============================================================
   Random Quote Generator – Script
   Local quotes, categories, favorites, copy, share, auto-rotate
   ============================================================ */

(function () {
  'use strict';

  /* ======================== QUOTES DATA ======================== */

  const quotes = [
    // Inspiration (6)
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Inspiration' },
    { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Inspiration' },
    { text: 'Your time is limited, so don\'t waste it living someone else\'s life.', author: 'Steve Jobs', category: 'Inspiration' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'Inspiration' },
    { text: 'Act as if what you do makes a difference. It does.', author: 'William James', category: 'Inspiration' },
    { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson', category: 'Inspiration' },

    // Wisdom (5)
    { text: 'The unexamined life is not worth living.', author: 'Socrates', category: 'Wisdom' },
    { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle', category: 'Wisdom' },
    { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates', category: 'Wisdom' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'Wisdom' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', category: 'Wisdom' },

    // Life (5)
    { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', category: 'Life' },
    { text: 'Get busy living or get busy dying.', author: 'Stephen King', category: 'Life' },
    { text: 'The purpose of our lives is to be happy.', author: 'Dalai Lama', category: 'Life' },
    { text: 'Life is really simple, but we insist on making it complicated.', author: 'Confucius', category: 'Life' },
    { text: 'You only live once, but if you do it right, once is enough.', author: 'Mae West', category: 'Life' },

    // Success (5)
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'Success' },
    { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau', category: 'Success' },
    { text: 'The secret of success is to do the common thing uncommonly well.', author: 'John D. Rockefeller Jr.', category: 'Success' },
    { text: 'Success is walking from failure to failure with no loss of enthusiasm.', author: 'Winston Churchill', category: 'Success' },
    { text: 'Try not to become a man of success, but rather try to become a man of value.', author: 'Albert Einstein', category: 'Success' },

    // Love (5)
    { text: 'The best thing to hold onto in life is each other.', author: 'Audrey Hepburn', category: 'Love' },
    { text: 'Love all, trust a few, do wrong to none.', author: 'William Shakespeare', category: 'Love' },
    { text: 'Where there is love there is life.', author: 'Mahatma Gandhi', category: 'Love' },
    { text: 'Love is composed of a single soul inhabiting two bodies.', author: 'Aristotle', category: 'Love' },
    { text: 'The only thing we never get enough of is love.', author: 'Henry Miller', category: 'Love' },

    // Humor (5)
    { text: 'I am so clever that sometimes I don\'t understand a single word of what I am saying.', author: 'Oscar Wilde', category: 'Humor' },
    { text: 'Always forgive your enemies; nothing annoys them so much.', author: 'Oscar Wilde', category: 'Humor' },
    { text: 'I\'m not afraid of death. I just don\'t want to be there when it happens.', author: 'Woody Allen', category: 'Humor' },
    { text: 'The trouble with being punctual is that nobody\'s there to appreciate it.', author: 'Franklin P. Jones', category: 'Humor' },
    { text: 'A day without laughter is a day wasted.', author: 'Charlie Chaplin', category: 'Humor' },

    // Creativity (5)
    { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein', category: 'Creativity' },
    { text: 'Every child is an artist. The problem is how to remain an artist once we grow up.', author: 'Pablo Picasso', category: 'Creativity' },
    { text: 'Creativity takes courage.', author: 'Henri Matisse', category: 'Creativity' },
    { text: 'The chief enemy of creativity is good sense.', author: 'Pablo Picasso', category: 'Creativity' },
    { text: 'To live a creative life, we must lose our fear of being wrong.', author: 'Joseph Chilton Pearce', category: 'Creativity' },

    // Motivation (5)
    { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela', category: 'Motivation' },
    { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson', category: 'Motivation' },
    { text: 'The harder you work for something, the greater you\'ll feel when you achieve it.', author: 'Unknown', category: 'Motivation' },
    { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown', category: 'Motivation' },
    { text: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown', category: 'Motivation' }
  ];

  /* ======================== STATE ======================== */

  let currentQuote = null;
  let autoTimer = null;
  let favorites = loadFavorites();
  let favoritesVisible = false;

  /* ======================== DOM REFS ======================== */

  const quoteTextEl      = document.getElementById('quoteText');
  const quoteAuthorEl    = document.getElementById('quoteAuthor').querySelector('span');
  const quoteCategoryEl  = document.getElementById('quoteCategory');
  const newQuoteBtn      = document.getElementById('newQuoteBtn');
  const categoryFilter   = document.getElementById('categoryFilter');
  const searchInput      = document.getElementById('searchInput');
  const autoRotateCheck  = document.getElementById('autoRotateCheck');
  const copyBtn          = document.getElementById('copyBtn');
  const shareBtn         = document.getElementById('shareBtn');
  const favBtn           = document.getElementById('favBtn');
  const favLabel         = document.getElementById('favLabel');
  const toast            = document.getElementById('toast');
  const toggleFavsBtn    = document.getElementById('toggleFavoritesBtn');
  const favoritesList    = document.getElementById('favoritesList');
  const favCount         = document.getElementById('favCount');

  /* ======================== UTILITY ======================== */

  function getFilteredQuotes() {
    const category = categoryFilter.value;
    const query    = searchInput.value.trim().toLowerCase();
    let filtered   = quotes;

    if (category !== 'all') {
      filtered = filtered.filter(q => q.category === category);
    }

    if (query) {
      filtered = filtered.filter(q =>
        q.text.toLowerCase().includes(query) ||
        q.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  function getRandomQuote() {
    const pool = getFilteredQuotes();
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ======================== DISPLAY ======================== */

  function displayQuote(quote) {
    if (!quote) {
      quoteTextEl.textContent = 'No quotes match your filters.';
      quoteAuthorEl.textContent = '';
      quoteCategoryEl.textContent = '';
      quoteCategoryEl.removeAttribute('data-category');
      toggleFavActive(false);
      return;
    }

    quoteTextEl.textContent = quote.text;
    quoteAuthorEl.textContent = quote.author;
    quoteCategoryEl.textContent = quote.category;
    quoteCategoryEl.setAttribute('data-category', quote.category);
    currentQuote = quote;
    updateFavButton();
  }

  function showNewQuote() {
    const quote = getRandomQuote();
    displayQuote(quote);
  }

  /* ======================== FAVORITES ======================== */

  function loadFavorites() {
    try {
      const data = localStorage.getItem('qg_favorites');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem('qg_favorites', JSON.stringify(favorites));
  }

  function toggleFavorite(quote) {
    if (!quote) return;
    const idx = favorites.findIndex(f =>
      f.text === quote.text && f.author === quote.author
    );
    if (idx === -1) {
      favorites.push({ text: quote.text, author: quote.author, category: quote.category });
    } else {
      favorites.splice(idx, 1);
    }
    saveFavorites();
    updateFavButton();
    updateFavCount();
    renderFavorites();
  }

  function isFavorite(quote) {
    if (!quote) return false;
    return favorites.some(f =>
      f.text === quote.text && f.author === quote.author
    );
  }

  function updateFavButton() {
    const fav = isFavorite(currentQuote);
    favBtn.classList.toggle('active', fav);
    favLabel.textContent = fav ? 'Unfavorite' : 'Favorite';
  }

  function toggleFavActive(state) {
    favBtn.classList.toggle('active', state);
    favLabel.textContent = state ? 'Favorite' : 'Favorite';
  }

  function updateFavCount() {
    favCount.textContent = favorites.length;
  }

  function renderFavorites() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="empty-favs">No favorites yet. Click the heart to save a quote.</p>';
      return;
    }

    favorites.forEach(fav => {
      const div = document.createElement('div');
      div.className = 'fav-item';

      div.innerHTML = `
        <div class="quote-text">${fav.text}</div>
        <div class="quote-author">— ${fav.author}</div>
        <span class="category-badge" data-category="${fav.category}">${fav.category}</span>
        <button class="remove-fav" data-text="${escapeAttr(fav.text)}" data-author="${escapeAttr(fav.author)}" aria-label="Remove favorite">
          <i class="fas fa-times"></i>
        </button>
      `;

      const removeBtn = div.querySelector('.remove-fav');
      removeBtn.addEventListener('click', function () {
        const idx = favorites.findIndex(f =>
          f.text === this.dataset.text && f.author === this.dataset.author
        );
        if (idx !== -1) {
          favorites.splice(idx, 1);
          saveFavorites();
          updateFavCount();
          updateFavButton();
          renderFavorites();
        }
      });

      favoritesList.appendChild(div);
    });
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ======================== COPY ======================== */

  function copyToClipboard(text) {
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    showToast('Copied to clipboard');
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) { /* silent */ }
    document.body.removeChild(textarea);
  }

  /* ======================== SHARE ======================== */

  function shareOnTwitter(quote) {
    if (!quote) return;
    const text = encodeURIComponent(`"${quote.text}" — ${quote.author}`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /* ======================== TOAST ======================== */

  let toastTimeout = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  /* ======================== AUTO-ROTATE ======================== */

  function startAutoRotate() {
    stopAutoRotate();
    autoTimer = setInterval(showNewQuote, 10000);
  }

  function stopAutoRotate() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /* ======================== EVENT LISTENERS ======================== */

  // New Quote
  newQuoteBtn.addEventListener('click', showNewQuote);

  // Category filter
  categoryFilter.addEventListener('change', showNewQuote);

  // Search input (debounced)
  let searchDebounce = null;
  searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(showNewQuote, 300);
  });

  // Auto-rotate toggle
  autoRotateCheck.addEventListener('change', function () {
    if (this.checked) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
  });

  // Copy
  copyBtn.addEventListener('click', function () {
    if (!currentQuote) return;
    copyToClipboard(`"${currentQuote.text}" — ${currentQuote.author}`);
  });

  // Share
  shareBtn.addEventListener('click', function () {
    shareOnTwitter(currentQuote);
  });

  // Favorite toggle
  favBtn.addEventListener('click', function () {
    toggleFavorite(currentQuote);
  });

  // Toggle favorites section
  toggleFavsBtn.addEventListener('click', function () {
    favoritesVisible = !favoritesVisible;
    favoritesList.classList.toggle('hidden', !favoritesVisible);
  });

  /* ======================== INIT ======================== */

  updateFavCount();
  renderFavorites();
  showNewQuote();

})();
