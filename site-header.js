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
  // Логотип ESK Engineering — встроен как base64, чтобы не тянуть
  // отдельный файл-картинку на каждую страницу
  const LOGO_DATA_URI = 'data:image/png;base64,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';

  mount.innerHTML = `
    <header class="site-header">
      <div class="site-brand" style="display:flex;align-items:center;gap:10px;">
        <img class="site-logo" src="${LOGO_DATA_URI}" alt="ESK Engineering" style="height:38px;width:auto;display:block;flex-shrink:0;">
        <h1 style="margin:0;">Электронный справочник конструктора</h1>
      </div>
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
    } else if (idx === -1 && SITE_PAGES.length > 0){
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
     Простое и надёжное правило: закрыто ВСЁ, кроме index.html и
     about.html. Не зависит от SECTIONS/site-structure.js — так гейт
     работает даже если на какой-то странице забыли подключить этот
     файл (раньше именно это было причиной, что доступ был открыт
     везде). Это программная блокировка на уровне браузера — не
     защита данных, а фильтр для случайных посетителей и способ
     учитывать реальных пользователей справочника.
     ══════════════════════════════════════════════════════════════ */
  const isCalculatorPage = current !== 'index.html' && current !== 'about.html';
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
