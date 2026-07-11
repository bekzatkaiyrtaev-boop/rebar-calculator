/* ══════════════════════════════════════════════════════════════
   ОБЩАЯ ШАПКА САЙТА — логика
   Подключается одинаково на каждой странице справочника:
     <div id="site-header"></div>
     <script src="site-header.js"></script>

   Чтобы добавить/убрать кнопку навигации, изменить название сайта
   или порядок страниц — правьте ТОЛЬКО этот файл. Изменения сразу
   применятся на всех страницах, где подключён этот скрипт.
   ══════════════════════════════════════════════════════════════ */

(function(){

  /* ── Порядок страниц для кнопок "Назад / Вперёд" ── */
  const SITE_PAGES = [
    { href: "Vedomost_elementov.html", title: "Ведомость деталей" },
    { href: "ankerovka-nahlest.html",  title: "Анкеровка и нахлёст арматуры" },
    { href: "zashitny-sloy.html",      title: "Защитный слой бетона" },
    { href: "dvutavry-b.html",         title: "Двутавры по ГОСТ 26020-83" },
    { href: "dvutavry-sto.html",       title: "Двутавры по СТО АСЧМ 20-93" },
    { href: "pv-listy.html",           title: "Листы стальные просечно-вытяжные" },
    { href: "rifl-listy.html",         title: "Листы стальные рифлёные" },
    { href: "trubi.html",              title: "Квадратные и прямоугольные трубы по ГОСТ 30245-2012" },
    { href: "peregorodka.html",        title: "Устойчивость перегородки" },
    { href: "peremychki.html",         title: "Подбор перемычек" },
    { href: "podbor-uteplitelya.html", title: "Подбор толщины утеплителя" },
    { href: "progony-1225-2.html",     title: "Прогоны и опорные плиты" },
    { href: "climat.html",             title: "Климатические параметры" },
    { href: "konverter.html",          title: "Конвертер единиц измерения" }
  ];

  /* ── Кнопки навигации в шапке (порядок = порядок отображения) ──
     Чтобы добавить новую кнопку — просто добавьте объект в массив.
     current: true  — эта кнопка ведёт на текущую страницу (авто)
     dynamic: "prev"/"next" — управляется скриптом (Назад/Вперёд) */
  const NAV_ITEMS = [
    { href: "index.html",  label: "Содержание" },
    { href: "#", label: "← Назад",   dynamic: "prev" },
    { href: "#", label: "Вперёд →",  dynamic: "next" },
    { href: "about.html",  label: "Об авторе" }
  ];

  const mount = document.getElementById('site-header');
  if (!mount) return;

  const current = location.pathname.split('/').pop() || 'index.html';
  const isCover = current === 'index.html';
  const idx = SITE_PAGES.findIndex(p => p.href === current);

  /* ── Собираем HTML навигации ── */
  const navHTML = NAV_ITEMS.map(item => {
    const idAttr = item.dynamic ? ` id="siteNav${item.dynamic === 'prev' ? 'Prev' : 'Next'}"` : '';
    const isCurrent = !item.dynamic && item.href === current;
    const cls = isCurrent ? ' class="current"' : (item.dynamic ? ' class="disabled"' : '');
    return `<a href="${item.href}"${idAttr}${cls}>${item.label}</a>`;
  }).join('<span class="sep">·</span>');

  /* ── Рендерим шапку ── */
  mount.innerHTML = `
    <header class="site-header">
      <h1>Электронный справочник конструктора</h1>
      <nav class="site-nav">${navHTML}</nav>
    </header>
  `;

  /* ── Настраиваем "Назад / Вперёд" по позиции в SITE_PAGES ── */
  const prevBtn = document.getElementById('siteNavPrev');
  const nextBtn = document.getElementById('siteNavNext');

  if (prevBtn && nextBtn){
    if (idx > 0){
      prevBtn.href = SITE_PAGES[idx - 1].href;
      prevBtn.title = SITE_PAGES[idx - 1].title;
      prevBtn.classList.remove('disabled');
    }
    if (idx >= 0 && idx < SITE_PAGES.length - 1){
      nextBtn.href = SITE_PAGES[idx + 1].href;
      nextBtn.title = SITE_PAGES[idx + 1].title;
      nextBtn.classList.remove('disabled');
    } else if (idx === -1){
      // Мы не на одной из "листов" (например, index.html или about.html) —
      // "Вперёд" ведёт к первой странице справочника
      nextBtn.href = SITE_PAGES[0].href;
      nextBtn.title = SITE_PAGES[0].title;
      nextBtn.classList.remove('disabled');
    }
  }

  /* ══════════════════════════════════════════════════════════════
     СЧЁТЧИК "СЕЙЧАС НА САЙТЕ" — временно отключён.
     Бэкенд (/api/presence) и бейдж в шапке пока убраны из показа.
     Чтобы включить обратно — верните <div class="site-online">...</div>
     в разметку выше и код пинга (см. историю правок).
     ══════════════════════════════════════════════════════════════ */
})();
