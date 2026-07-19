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

  // Стили шапки — добавляем один раз в <head>, чтобы не заводить
  // отдельный CSS-файл. Логика (JS) при этом не меняется.
  if (!document.getElementById('site-header-styles')){
    const headerStyle = document.createElement('style');
    headerStyle.id = 'site-header-styles';
    headerStyle.textContent = `
      .site-header{
        padding:18px 24px 10px;
      }
      .site-header-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:25px;
        padding-bottom:14px;
        margin-bottom:14px;
        border-bottom:1px solid rgba(255,255,255,.12);
      }
      .site-brand{
        width:320px;
        display:flex;
        align-items:center;
      }
      .site-brand a{
        display:inline-block;
      }
      .site-logo{
        display:block;
        height:58px;
        width:auto;
        transition:transform .18s ease;
      }
      .site-brand a:hover .site-logo{
        transform:scale(1.04);
      }
      .site-title{
        flex:1;
        text-align:center;
      }
      .site-title-main{
        font-size:30px;
        font-weight:700;
        letter-spacing:.5px;
      }
      .site-auth{
        width:320px;
        display:flex;
        justify-content:flex-end;
      }
      .site-nav{
        margin-top:18px;
        display:flex;
        justify-content:center;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      }
      .site-nav .sep{
        display:none;
      }
      .site-nav a{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:38px;
        padding:0 18px;
        border-radius:5px;
        transition:.18s;
      }
      .site-nav a:hover{
        background:rgba(255,255,255,.08);
      }
      .site-nav a.current{
        font-weight:700;
        box-shadow:inset 0 -2px 0 #fff;
      }
    `;
    document.head.appendChild(headerStyle);
  }

  mount.innerHTML = `
    <header class="site-header">
      <div class="site-header-top">
        <div class="site-brand">
          <a href="index.html">
            <img class="site-logo" src="${LOGO_DATA_URI}" alt="ESK Engineering">
          </a>
        </div>
        <div class="site-title">
          <div class="site-title-main">Электронный справочник конструктора</div>
        </div>
        <div class="site-auth" id="siteAuth"></div>
      </div>
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
