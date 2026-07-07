(function () {
  'use strict';

  /* ================= NAV ================= */
  function showView(name) {
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.dataset.view === name);
    });
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-goto]').forEach(function (btn) {
    btn.addEventListener('click', function () { showView(btn.dataset.goto); });
  });
  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () { showView('home'); });
  });

  /* ================= HOME COUNTS ================= */
  document.getElementById('home-count-vehicles').textContent = VEHICLES.length + ' آليات';

  /* ================= MODAL ================= */
  var overlay = document.getElementById('modal-overlay');
  var modalIcon = document.getElementById('modal-icon');
  var modalTitle = document.getElementById('modal-title');
  var modalSub = document.getElementById('modal-sub');
  var modalBody = document.getElementById('modal-body');

  function openModal(icon, title, sub, bodyHtml) {
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalSub.textContent = sub || '';
    modalBody.innerHTML = bodyHtml;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  function pendingStateHtml(kind) {
    var label = kind === 'contents' ? 'محتويات' : 'معلومات';
    return '' +
      '<div class="pending-state">' +
        '<div class="icon">' + (kind === 'contents' ? '📦' : '📝') + '</div>' +
        '<div class="title">قيد التحديث</div>' +
        '<div class="desc">سيتم إضافة ' + label + ' هذه الآلية قريباً</div>' +
      '</div>';
  }

  var esc = function (s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  };

  /* ================= CONTENTS MODAL ================= */
  function openContentsModal(vehicle) {
    if (!vehicle.contents) {
      openModal(vehicle.icon, vehicle.name, vehicle.sub, pendingStateHtml('contents'));
      return;
    }
    var sections = vehicle.contents.sections;
    var tabsHtml = sections.map(function (sec, i) {
      return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + sec.id + '">' + esc(sec.label) + '</button>';
    }).join('');
    var panelsHtml = sections.map(function (sec, i) {
      var rows = sec.items.map(function (it) {
        return '<tr><td>' + esc(it.name) + '</td><td>' + esc(it.qty) + '</td></tr>';
      }).join('');
      var total = sec.items.reduce(function (s, it) { return s + it.qty; }, 0);
      return '' +
        '<div class="tab-panel' + (i === 0 ? ' active' : '') + '" data-panel="' + sec.id + '">' +
          '<div class="tab-panel-label">📦 ' + esc(sec.label) + '</div>' +
          '<table class="items-table"><thead><tr><th>الصنف</th><th>الكمية</th></tr></thead><tbody>' + rows + '</tbody></table>' +
          '<span class="total-badge">📋 الإجمالي: ' + total + ' قطعة</span>' +
        '</div>';
    }).join('');

    var descHtml = vehicle.desc ? '<p class="spec-intro">' + esc(vehicle.desc) + '</p>' : '';
    openModal(vehicle.icon, vehicle.name, vehicle.sub, descHtml + '<div class="tabs">' + tabsHtml + '</div>' + panelsHtml);

    modalBody.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        modalBody.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        modalBody.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        modalBody.querySelector('[data-panel="' + btn.dataset.tab + '"]').classList.add('active');
      });
    });
  }

  /* ================= SPECS MODAL ================= */
  function buildSpecSection(sec) {
    var html = '<div class="spec-section"><div class="spec-section-title">' + esc(sec.title) + '</div>';
    if (sec.intro) html += '<p class="spec-intro">' + esc(sec.intro) + '</p>';
    if (sec.desc) html += '<p class="spec-desc">' + esc(sec.desc) + '</p>';
    if (sec.table && sec.table.length) {
      html += '<table class="spec-table"><tbody>' + sec.table.map(function (row) {
        return '<tr><td class="spec-key">' + esc(row.label) + '</td><td class="spec-val">' + esc(row.value) + '</td></tr>';
      }).join('') + '</tbody></table>';
    }
    if (sec.items && sec.items.length) {
      html += '<ul class="spec-list">' + sec.items.map(function (it) { return '<li>' + esc(it) + '</li>'; }).join('') + '</ul>';
    }
    if (sec.note) html += '<div class="spec-note">⚠️ ' + esc(sec.note) + '</div>';
    html += '</div>';
    return html;
  }

  function openSpecsModal(vehicle) {
    if (!vehicle.specs) {
      openModal(vehicle.icon, vehicle.name, vehicle.sub, pendingStateHtml('specs'));
      return;
    }
    var html = vehicle.specs.sections.map(buildSpecSection).join('');
    openModal(vehicle.icon, vehicle.name, vehicle.sub, html);
  }

  /* ================= RENDER: vehicles ================= */
  var vehicleList = document.getElementById('vehicle-list');
  VEHICLES.forEach(function (v) {
    var isPending = !v.contents && !v.specs;
    var card = document.createElement('div');
    card.className = 'vehicle-card' + (isPending ? ' pending' : '');
    card.innerHTML = '' +
      '<div class="vehicle-card-top">' +
        '<div class="vehicle-num">' + esc(v.number) + '</div>' +
        '<div class="vehicle-icon">' + v.icon + '</div>' +
        '<div class="vehicle-info">' +
          '<h3>' + esc(v.name) + '</h3>' +
          '<div class="vehicle-sub">' + esc(v.sub) + '</div>' +
          (v.desc ? '<div class="vehicle-desc">' + esc(v.desc) + '</div>' : '') +
          (isPending ? '<span class="pending-chip">قيد التحديث</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="vehicle-btns">' +
        '<button class="v-btn v-btn-contents" data-action="contents">📦 المحتويات</button>' +
        '<button class="v-btn v-btn-info" data-action="specs">📋 المعلومات</button>' +
      '</div>';
    card.querySelector('[data-action="contents"]').addEventListener('click', function () { openContentsModal(v); });
    card.querySelector('[data-action="specs"]').addEventListener('click', function () { openSpecsModal(v); });
    vehicleList.appendChild(card);
  });

  /* ================= RENDER: equipment ================= */
  var equipmentGrid = document.getElementById('equipment-grid');
  EQUIPMENT.forEach(function (item) {
    var card = document.createElement('div');
    card.className = 'eq-card';
    var tags = item.tags.map(function (t) {
      return '<span class="tag tag-' + t.type + '">' + esc(t.label) + '</span>';
    }).join('');
    card.innerHTML = '' +
      '<div class="eq-card-head">' +
        '<span class="ic">' + item.icon + '</span>' +
        '<div><h4>' + esc(item.title) + '</h4><div class="cat">' + esc(item.category) + '</div></div>' +
      '</div>' +
      '<div class="eq-card-body"><p>' + esc(item.desc) + '</p>' + tags + '</div>';
    equipmentGrid.appendChild(card);
  });

  /* ================= RENDER: skills ================= */
  var skillsGrid = document.getElementById('skills-grid');
  SKILLS.forEach(function (item) {
    var card = document.createElement('div');
    card.className = 'sk-card';
    var stepsHtml = item.steps.map(function (s, i) {
      return '<div class="sk-step"><div class="sk-num">' + (i + 1) + '</div><p>' + esc(s) + '</p></div>';
    }).join('');
    var tagsHtml = item.tags.map(function (t) {
      return '<span class="tag tag-' + t.type + '">' + esc(t.label) + '</span>';
    }).join('');
    var extraHtml = '';
    if (item.extra) {
      extraHtml = '' +
        '<button class="sk-toggle" data-toggle>▾ عرض المزيد</button>' +
        '<div class="sk-extra">' +
          '<h5>' + esc(item.extra.title) + '</h5>' +
          '<ul>' + item.extra.items.map(function (li) { return '<li>' + esc(li) + '</li>'; }).join('') + '</ul>' +
        '</div>';
    }
    card.innerHTML = '' +
      '<div class="sk-head">' +
        '<span class="sk-ico">' + item.icon + '</span>' +
        '<div><h4>' + esc(item.title) + '</h4><div class="ref">المعدة: <b>' + esc(item.ref) + '</b></div></div>' +
      '</div>' +
      '<div class="sk-steps">' + stepsHtml + '</div>' +
      '<div class="sk-foot">' + tagsHtml + '</div>' +
      extraHtml;

    var toggleBtn = card.querySelector('[data-toggle]');
    if (toggleBtn) {
      var extraEl = card.querySelector('.sk-extra');
      toggleBtn.addEventListener('click', function () {
        var open = extraEl.classList.toggle('open');
        toggleBtn.textContent = open ? '▴ إخفاء' : '▾ عرض المزيد';
      });
    }
    skillsGrid.appendChild(card);
  });

  /* ================= PWA: register service worker ================= */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
