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
  /* ── Порядок страниц для "Назад/Вперёд" строим из общей структуры
     сайта (site-structure.js), а не храним отдельным списком —
     чтобы порядок в содержании и порядок пролистывания совпадали
     всегда автоматически. Файл site-structure.js должен быть
     подключён на странице ДО этого скрипта. ── */
  const SITE_PAGES = [];
  if (typeof SECTIONS !== 'undefined'){
    SECTIONS.forEach(section => {
      section.items.forEach(entry => {
        if (entry.group){
          entry.items.forEach(it => SITE_PAGES.push({ href: it.href, title: it.title }));
        } else {
          SITE_PAGES.push({ href: entry.href, title: entry.title });
        }
      });
    });
  }
  // на всякий случай убираем index.html/about.html, если они вдруг
  // попадут в SECTIONS — это не "листы" калькуляторов
  const SITE_PAGES_FILTERED = SITE_PAGES.filter(p => p.href !== 'index.html' && p.href !== 'about.html');
  SITE_PAGES.length = 0;
  SITE_PAGES.push(...SITE_PAGES_FILTERED);

  /* ── Отдельный полный список ВСЕХ страниц-калькуляторов (для проверки
     доступа), включая сами групповые страницы (например,
     armatura-34028-2016.html), которые НЕ входят в SITE_PAGES выше,
     потому что не участвуют в пролистывании "Назад/Вперёд" напрямую. ── */
  const ALL_CALC_PAGES = [];
  if (typeof SECTIONS !== 'undefined'){
    SECTIONS.forEach(section => {
      section.items.forEach(entry => {
        if (entry.group){
          ALL_CALC_PAGES.push(entry.href);
          entry.items.forEach(it => ALL_CALC_PAGES.push(it.href));
        } else {
          ALL_CALC_PAGES.push(entry.href);
        }
      });
    });
  }

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
      <div class="site-auth" id="siteAuth"></div>
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

  /* ══════════════════════════════════════════════════════════════
     АВТОРИЗАЦИЯ ЧЕРЕЗ GOOGLE
     Использует Google Identity Services (кнопка "Войти через Google").
     После входа сохраняем данные пользователя в localStorage (чтобы
     не логиниться заново на каждой странице) и отправляем на бэкенд
     для учёта (сколько людей пользуется справочником).
     ══════════════════════════════════════════════════════════════ */

  // Client ID из Google Cloud Console (не секретный, можно хранить в коде)
  const GOOGLE_CLIENT_ID = '911707760655-toihq4a9jn9qb6khnat8rsbs2ahm39pd.apps.googleusercontent.com';
  const USER_LOG_API_URL = 'https://rebar-backend-henna.vercel.app/api/log-user';
  const AUTH_STORAGE_KEY = 'esk_user';

  const authMount = document.getElementById('siteAuth');

  function getSavedUser(){
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }

  function saveUser(user){
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  function clearUser(){
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Разбираем JWT-токен от Google, чтобы достать имя/почту/фото
  function decodeJwt(token){
    try {
      const payload = token.split('.')[1];
      const decoded = decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decoded);
    } catch(e){ return null; }
  }

  function renderSignedIn(user){
    authMount.innerHTML = `
      <div class="auth-user">
        <img class="auth-avatar" src="${user.picture}" alt="${user.name}">
        <span class="auth-name">${user.name}</span>
        <button class="auth-logout" id="authLogoutBtn" title="Выйти">Выйти</button>
      </div>
    `;
    document.getElementById('authLogoutBtn').addEventListener('click', function(){
      clearUser();
      renderSignedOut();
    });
  }

  function renderSignedOut(){
    authMount.innerHTML = `<div id="googleSignInBtn"></div>`;
    if (window.google && google.accounts && google.accounts.id){
      google.accounts.id.renderButton(
        document.getElementById('googleSignInBtn'),
        { theme: 'outline', size: 'medium', text: 'signin', locale: 'ru' }
      );
    }
  }

  function handleGoogleSignIn(response){
    const profile = decodeJwt(response.credential);
    if (!profile) return;
    const user = {
      name: profile.name,
      email: profile.email,
      picture: profile.picture
    };
    saveUser(user);
    renderSignedIn(user);
    hideAuthGate();

    // Отправляем данные на бэкенд для учёта пользователей (не блокирует интерфейс)
    fetch(USER_LOG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).catch(function(){ /* тихо игнорируем — учёт не критичен для работы сайта */ });
  }
  window.handleGoogleSignIn = handleGoogleSignIn;

  /* ══════════════════════════════════════════════════════════════
     ОГРАНИЧЕНИЕ ДОСТУПА К КАЛЬКУЛЯТОРАМ
     Страницы самих расчётных инструментов (все, что есть в SITE_PAGES,
     т.е. НЕ index.html и НЕ about.html) доступны только вошедшим
     через Google. Это программная блокировка на уровне браузера —
     не защита данных, а фильтр для случайных посетителей и способ
     учитывать реальных пользователей справочника.
     ══════════════════════════════════════════════════════════════ */
  const isCalculatorPage = ALL_CALC_PAGES.includes(current);
  let authGateEl = null;

  function showAuthGate(){
    if (authGateEl) return;
    document.body.style.overflow = 'hidden';
    authGateEl = document.createElement('div');
    authGateEl.id = 'authGate';
    authGateEl.innerHTML = `
      <div class="auth-gate-box">
        <h2>Доступ по входу через Google</h2>
        <p>Чтобы открыть расчётные материалы справочника, войдите через свой Google-аккаунт — это бесплатно и займёт пару секунд.</p>
        <div id="googleSignInBtnGate"></div>
        <a class="auth-gate-back" href="index.html">← Вернуться к содержанию</a>
      </div>
    `;
    document.body.appendChild(authGateEl);
    renderGateButtonIfReady();
  }

  function hideAuthGate(){
    if (authGateEl){
      authGateEl.remove();
      authGateEl = null;
    }
    document.body.style.overflow = '';
  }

  function renderGateButtonIfReady(){
    const gateBtn = document.getElementById('googleSignInBtnGate');
    if (gateBtn && window.google && google.accounts && google.accounts.id){
      google.accounts.id.renderButton(
        gateBtn,
        { theme: 'filled_blue', size: 'large', text: 'signin_with', locale: 'ru' }
      );
    }
  }

  if (authMount){
    const saved = getSavedUser();
    if (saved){
      renderSignedIn(saved);
    } else if (isCalculatorPage){
      showAuthGate();
    }

    // Подключаем скрипт Google Identity Services, если его ещё нет на странице
    if (!document.getElementById('google-identity-script')){
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-identity-script';
      script.onload = function(){
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn
        });
        if (!saved){
          renderSignedOut();
          renderGateButtonIfReady();
        }
      };
      document.head.appendChild(script);
    } else if (!saved){
      renderSignedOut();
      renderGateButtonIfReady();
    }
  }
})();
