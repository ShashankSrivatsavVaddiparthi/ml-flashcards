/*  flashcard_engine.js  — shared logic for all batches  */

(function () {

  var cards        = [];
  var filtered     = [];
  var currentIdx   = 0;
  var currentStage = 0;
  var filterMode   = 'all';
  var isMobile     = false;

  var SK = function() { return 'fc_' + (window.BATCH_ID || 'batch'); };

  function loadState() {
    try { return JSON.parse(localStorage.getItem(SK())) || {}; } catch(e) { return {}; }
  }
  function saveState(obj) {
    try { localStorage.setItem(SK(), JSON.stringify(obj)); } catch(e) {}
  }
  function getCardState(id) {
    return loadState()[id] || { status: 'unseen' };
  }
  function setCardStatus(id, status) {
    var s = loadState();
    s[id] = { status: status };
    saveState(s);
  }

  function checkMobile() {
    isMobile = window.innerWidth <= 780;
  }

  function init() {
    if (!window.FLASHCARD_DATA || !window.FLASHCARD_DATA.length) {
      document.getElementById('card-outer').innerHTML =
        '<div class="empty-state"><h3>No cards found</h3><p>Check the data file loaded correctly.</p></div>';
      return;
    }
    cards = window.FLASHCARD_DATA;
    checkMobile();
    buildLayout();
    applyFilter();
    render();
    bindKeys();
    bindSwipe();
    window.addEventListener('resize', function() {
      checkMobile();
    });
  }

  /* ── Layout builder ──────────────────────── */
  function buildLayout() {
    var cardOuter = document.getElementById('card-outer');
    var navRow    = document.querySelector('.nav-row');
    if (!cardOuter || !navRow) return;

    var parent = cardOuter.parentNode;

    /* Drawer overlay (mobile card list) */
    var overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'drawer-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML =
      '<div class="drawer-panel" id="drawer-panel">'
      + '<div class="drawer-handle"></div>'
      + '<div class="drawer-title">All cards</div>'
      + '<div class="drawer-list" id="drawer-list"></div>'
      + '<div class="drawer-legend">'
      + '<div class="drawer-legend-item"><div class="sidebar-dot known" style="width:9px;height:9px;border-radius:50%;background:#1B5E20;flex-shrink:0"></div>Known</div>'
      + '<div class="drawer-legend-item"><div class="sidebar-dot" style="width:9px;height:9px;border-radius:50%;background:#E65100;flex-shrink:0"></div>Review</div>'
      + '<div class="drawer-legend-item"><div class="sidebar-dot" style="width:9px;height:9px;border-radius:50%;background:#ccc;flex-shrink:0"></div>Unseen</div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeDrawer();
    });

    /* Add drawer toggle button to header */
    var headerRight = document.querySelector('.header-right');
    if (headerRight) {
      var toggle = document.createElement('button');
      toggle.className = 'drawer-toggle';
      toggle.id = 'drawer-toggle';
      toggle.innerHTML = '&#9776; Cards';
      toggle.addEventListener('click', openDrawer);
      headerRight.insertBefore(toggle, headerRight.firstChild);
    }

    /* Wrap in app-layout */
    var layout = document.createElement('div');
    layout.className = 'app-layout';

    var mainCol = document.createElement('div');
    mainCol.className = 'main-col';

    /* Desktop sidebar */
    var sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.id = 'card-sidebar';
    sidebar.innerHTML =
      '<div class="sidebar-header">All cards</div>'
      + '<div class="sidebar-list-scroll"><div id="sidebar-list"></div></div>'
      + '<div class="sidebar-legend">'
      + '<div class="sidebar-legend-item"><div class="sidebar-dot known"></div>Known</div>'
      + '<div class="sidebar-legend-item"><div class="sidebar-dot review"></div>Review</div>'
      + '<div class="sidebar-legend-item"><div class="sidebar-dot unseen"></div>Unseen</div>'
      + '</div>';

    parent.insertBefore(layout, cardOuter);
    layout.appendChild(mainCol);
    layout.appendChild(sidebar);
    mainCol.appendChild(cardOuter);

    /* Mobile nav row (Prev / Reveal / Next) */
    var mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav-row';
    mobileNav.id = 'mobile-nav-row';
    mobileNav.innerHTML =
      '<button class="mobile-nav-btn" id="mob-prev">&#8592; Back</button>'
      + '<button class="mobile-nav-btn primary" id="mob-reveal">Reveal &#8594;</button>'
      + '<button class="mobile-nav-btn" id="mob-next">Skip &#8594;&#8594;</button>';
    mainCol.appendChild(mobileNav);

    document.getElementById('mob-prev').addEventListener('click', tapLeft);
    document.getElementById('mob-reveal').addEventListener('click', tapRight);
    document.getElementById('mob-next').addEventListener('click', function() {
      currentIdx++;
      currentStage = 0;
      render();
    });

    if (navRow.parentNode === parent) {
      parent.removeChild(navRow);
      mainCol.appendChild(navRow);
    }
  }

  function openDrawer() {
    var ov = document.getElementById('drawer-overlay');
    var panel = document.getElementById('drawer-panel');
    if (ov) { ov.style.display = 'block'; setTimeout(function() { ov.classList.add('open'); }, 10); }
    if (panel) panel.classList.add('open');
    renderDrawer();
  }
  function closeDrawer() {
    var ov = document.getElementById('drawer-overlay');
    var panel = document.getElementById('drawer-panel');
    if (ov) {
      ov.classList.remove('open');
      setTimeout(function() { if (ov) ov.style.display = 'none'; }, 300);
    }
    if (panel) panel.classList.remove('open');
  }

  /* ── Render sidebar (desktop) ─────────────── */
  function renderSidebar() {
    var list = document.getElementById('sidebar-list');
    if (!list) return;
    var state = loadState();
    var html = '';
    for (var i = 0; i < cards.length; i++) {
      var c  = cards[i];
      var st = (state[c.id] && state[c.id].status) || 'unseen';
      var isActive = (filtered[currentIdx] && filtered[currentIdx].id === c.id);
      html += '<div class="sidebar-item' + (isActive ? ' active' : '') + '" data-cardidx="' + i + '">'
        + '<div class="sidebar-dot ' + st + '"></div>'
        + '<span>' + esc(c.subtopic) + '</span>'
        + '</div>';
    }
    list.innerHTML = html;

    var items = list.querySelectorAll('.sidebar-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', (function(idx) {
        return function() {
          filterMode = 'all'; filtered = cards.slice();
          currentIdx = idx; currentStage = 0; render();
        };
      })(parseInt(items[j].dataset.cardidx, 10)));
    }

    var activeItem = list.querySelector('.sidebar-item.active');
    if (activeItem) {
      var sb = list.parentNode;
      if (sb) {
        var itemTop = activeItem.offsetTop;
        var itemH   = activeItem.offsetHeight;
        var vis     = sb.clientHeight;
        var scrollT = sb.scrollTop;
        if (itemTop < scrollT || itemTop + itemH > scrollT + vis) {
          sb.scrollTop = itemTop - vis / 2 + itemH / 2;
        }
      }
    }
  }

  /* ── Render drawer (mobile) ───────────────── */
  function renderDrawer() {
    var list = document.getElementById('drawer-list');
    if (!list) return;
    var state = loadState();
    var dotColors = { known: '#1B5E20', review: '#E65100', unseen: '#ccc' };
    var html = '';
    for (var i = 0; i < cards.length; i++) {
      var c  = cards[i];
      var st = (state[c.id] && state[c.id].status) || 'unseen';
      var isActive = (filtered[currentIdx] && filtered[currentIdx].id === c.id);
      var color = dotColors[st] || '#ccc';
      html += '<div class="drawer-item' + (isActive ? ' active' : '') + '" data-cardidx="' + i + '">'
        + '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></div>'
        + '<span>' + esc(c.subtopic) + '</span>'
        + '</div>';
    }
    list.innerHTML = html;

    var items = list.querySelectorAll('.drawer-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', (function(idx) {
        return function() {
          filterMode = 'all'; filtered = cards.slice();
          currentIdx = idx; currentStage = 0;
          closeDrawer();
          render();
        };
      })(parseInt(items[j].dataset.cardidx, 10)));
    }

    var activeItem = list.querySelector('.drawer-item.active');
    if (activeItem) {
      list.scrollTop = activeItem.offsetTop - list.clientHeight / 2 + activeItem.offsetHeight / 2;
    }
  }

  /* ── Update mobile nav button label ──────── */
  function updateMobileRevealBtn() {
    var btn  = document.getElementById('mob-reveal');
    var next = document.getElementById('mob-next');
    if (!btn) return;
    var card = filtered[currentIdx];
    if (!card) return;
    if (currentStage < maxStage(card)) {
      btn.textContent = 'Reveal \u2192';
      btn.style.background = '';
      btn.style.borderColor = '';
    } else {
      btn.textContent = 'Next card \u2192\u2192';
      btn.style.background = '#1B5E20';
      btn.style.borderColor = '#1B5E20';
    }
    /* disable back btn at first stage of first card */
    var prev = document.getElementById('mob-prev');
    if (prev) prev.disabled = (currentIdx === 0 && currentStage === 0);
  }

  /* ── Swipe support ───────────────────────── */
  function bindSwipe() {
    var card = document.getElementById('card-outer');
    if (!card) return;
    var startX = 0;
    var startY = 0;
    document.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      if (!isMobile) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) tapRight();
      else        tapLeft();
    }, { passive: true });
  }

  /* ── Filter / stage helpers ──────────────── */
  function applyFilter() {
    if (filterMode === 'review') {
      filtered = cards.filter(function(c) { return getCardState(c.id).status === 'review'; });
    } else {
      filtered = cards.slice();
    }
    currentIdx   = 0;
    currentStage = 0;
  }

  function maxStage(card) {
    if (card.realworld && card.realworld.trim()) return 4;
    if (card.code      && card.code.trim())      return 3;
    return 2;
  }

  /* ── Main render ─────────────────────────── */
  function render() {
    updateProgress();
    updateFilterBtns();
    if (!filtered.length)              { renderEmpty(); renderSidebar(); return; }
    if (currentIdx >= filtered.length) { renderDone();  renderSidebar(); return; }
    renderCard(filtered[currentIdx]);
    renderSidebar();
    updateMobileRevealBtn();
  }

  /* ── Card renderer ───────────────────────── */
  function renderCard(card) {
    var outer       = document.getElementById('card-outer');
    var cs          = getCardState(card.id);
    var stripeColor = (window.TOPIC_COLORS && window.TOPIC_COLORS[card.topic]) || '#1a1a2e';
    var ms          = maxStage(card);

    var sections = '';
    if (currentStage === 0) {
      sections = '<div class="section-recall">'
        + '<p>Try to recall the answer, then tap to reveal.</p>'
        + '</div>';
    }
    if (currentStage >= 1) {
      sections += '<div class="section-theory">'
        + '<div class="section-label theory">&#9670; Theory</div>'
        + '<p>' + esc(card.theory) + '</p>'
        + '</div>';
    }
    if (currentStage >= 2) {
      sections += '<div class="section-interview">'
        + '<div class="section-label interview">&#9670; Interview Answer &mdash; say this out loud</div>'
        + '<p>' + esc(card.interview) + '</p>'
        + '</div>';
    }
    if (currentStage >= 3 && card.code && card.code.trim()) {
      sections += '<div class="section-code">'
        + '<div class="section-label code">&#9670; Code Snippet</div>'
        + '<pre>' + esc(card.code) + '</pre>'
        + '</div>';
    }
    if (currentStage >= 4 && card.realworld && card.realworld.trim()) {
      sections += '<div class="section-realworld">'
        + '<div class="section-label realworld">&#9670; Real-world Example</div>'
        + '<p>' + esc(card.realworld) + '</p>'
        + '</div>';
    }

    var stageNames = ['Recall', '+ Theory', '+ Interview Answer', '+ Code', '+ Real-world Example'];
    var hintBar = '<div class="stage-hint">'
      + '<span class="stage-dot stage-' + currentStage + '"></span>'
      + '<span>' + (stageNames[currentStage] || '') + '</span>'
      + '</div>';

    var dotsHtml = '';
    for (var i = 0; i <= ms; i++) {
      dotsHtml += '<div class="sdot' + (i <= currentStage ? ' active' : '') + '"></div>';
    }

    var tapHint = currentStage < ms
      ? 'Click right half to reveal more &nbsp;|&nbsp; Click left half to go back'
      : 'Click right half for next card &nbsp;|&nbsp; Click left half to go back';

    outer.innerHTML =
      '<div class="card" id="main-card">'
      + '<div class="card-stripe" style="background:' + stripeColor + '"></div>'
      + '<div class="card-header">'
      + '<div class="card-topic">' + esc(card.topic) + '</div>'
      + '<div class="card-subtopic">' + esc(card.subtopic) + '</div>'
      + '</div>'
      + hintBar
      + '<div class="card-body">' + sections + '</div>'
      + '<div class="tap-left"  id="tap-left"></div>'
      + '<div class="tap-right" id="tap-right"></div>'
      + '</div>'
      + '<div class="stage-dots">' + dotsHtml + '</div>'
      + '<div class="tap-hint">' + tapHint + '</div>'
      + '<div class="mark-row" style="margin-top:10px">'
      + '<button class="mark-btn known'  + (cs.status === 'known'  ? ' selected' : '') + '" id="btn-known">&#10003; Known</button>'
      + '<button class="mark-btn review' + (cs.status === 'review' ? ' selected' : '') + '" id="btn-review">&#8635; Mark for Review</button>'
      + '</div>';

    document.getElementById('tap-right').addEventListener('click', tapRight);
    document.getElementById('tap-left' ).addEventListener('click', tapLeft);
    document.getElementById('btn-known').addEventListener('click', function(e) {
      e.stopPropagation();
      var cur = getCardState(card.id).status;
      var ns  = (cur === 'known') ? 'unseen' : 'known';
      setCardStatus(card.id, ns);
      updateMarkButtons(ns);
      updateProgress();
      renderSidebar();
    });
    document.getElementById('btn-review').addEventListener('click', function(e) {
      e.stopPropagation();
      var cur = getCardState(card.id).status;
      var ns  = (cur === 'review') ? 'unseen' : 'review';
      setCardStatus(card.id, ns);
      updateMarkButtons(ns);
      updateProgress();
      renderSidebar();
    });
  }

  function updateMarkButtons(status) {
    var bk = document.getElementById('btn-known');
    var br = document.getElementById('btn-review');
    if (bk) bk.classList.toggle('selected', status === 'known');
    if (br) br.classList.toggle('selected', status === 'review');
  }

  function renderEmpty() {
    document.getElementById('card-outer').innerHTML =
      '<div class="done-screen">'
      + '<h2>No review cards</h2>'
      + '<p>You have no cards marked for review.<br>Switch back to All Cards to study.</p>'
      + '<button class="nav-btn" onclick="setFilter(\'all\')" style="margin:0 auto;display:flex">Show all cards</button>'
      + '</div>';
  }

  function renderDone() {
    var state  = loadState();
    var known  = cards.filter(function(c) { return state[c.id] && state[c.id].status === 'known'; }).length;
    var review = cards.filter(function(c) { return state[c.id] && state[c.id].status === 'review'; }).length;
    var unseen = cards.length - known - review;
    document.getElementById('card-outer').innerHTML =
      '<div class="done-screen">'
      + '<h2>&#127881; Batch complete!</h2>'
      + '<p>You went through all ' + filtered.length + ' cards.</p>'
      + '<div class="done-stats">'
      + '<div class="done-stat"><strong style="color:#1B5E20">' + known  + '</strong>Known</div>'
      + '<div class="done-stat"><strong style="color:#E65100">' + review + '</strong>Review</div>'
      + '<div class="done-stat"><strong style="color:#757575">' + unseen + '</strong>Unseen</div>'
      + '</div>'
      + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
      + '<button class="nav-btn" onclick="restartBatch()">Restart batch</button>'
      + (review > 0 ? '<button class="nav-btn" onclick="setFilter(\'review\')">Study review cards (' + review + ')</button>' : '')
      + '</div>'
      + '</div>';
  }

  function updateProgress() {
    var state = loadState();
    var known = cards.filter(function(c) { return state[c.id] && state[c.id].status === 'known'; }).length;
    var pct   = cards.length ? Math.round(known / cards.length * 100) : 0;
    var fill  = document.getElementById('progress-fill');
    var metaL = document.getElementById('progress-meta-l');
    var metaR = document.getElementById('progress-meta-r');
    if (fill)  fill.style.width = pct + '%';
    if (metaL) metaL.textContent = 'Card ' + (Math.min(currentIdx + 1, filtered.length)) + ' of ' + filtered.length;
    if (metaR) metaR.textContent = known + ' / ' + cards.length + ' known';
  }

  function updateFilterBtns() {
    var btns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.filter === filterMode);
    }
  }

  function tapRight() {
    if (!filtered.length || currentIdx >= filtered.length) return;
    var card = filtered[currentIdx];
    if (currentStage < maxStage(card)) {
      currentStage++;
    } else {
      currentIdx++;
      currentStage = 0;
    }
    render();
  }

  function tapLeft() {
    if (currentStage > 0) {
      currentStage--;
    } else if (currentIdx > 0) {
      currentIdx--;
      currentStage = 0;
    }
    render();
  }

  function bindKeys() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); tapRight(); }
      if (e.key === 'ArrowLeft')                   { e.preventDefault(); tapLeft();  }
    });
  }

  window.setFilter    = function(mode) { filterMode = mode; applyFilter(); render(); };
  window.restartBatch = function()     { filterMode = 'all'; currentIdx = 0; currentStage = 0; applyFilter(); render(); };

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
