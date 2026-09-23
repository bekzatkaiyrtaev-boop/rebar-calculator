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

  /* ── Canonical URL ──
     Жёстко закрепляем esk.psdpro.kz как единственный "настоящий"
     адрес ЭСК для поисковиков — без canonical-тега Google иногда
     путает версии страниц и не выбирает основную.
     ВАЖНО (18.09): раньше здесь стоял www.psdpro.kz — это было верно,
     пока домен принадлежал ЭСК. После переезда домена на PSDPRO
     www.psdpro.kz — уже другой сайт, и старый canonical заставлял
     Google считать страницы ЭСК дублями несуществующих страниц на
     www.psdpro.kz и не индексировать их ("Вариант страницы с тегом
     canonical" в Search Console). Если домен ЭСК снова сменится —
     поправить здесь. */
  (function setCanonical(){
    // index.html нормализуем в "/", чтобы главная страница не получала
    // два разных canonical в зависимости от того, как на неё зашли
    // (корень сайта vs явная ссылка на index.html из навигации) —
    // именно этот разнобой в sitemap.xml (там прописан корень "/")
    const normalizedPath = location.pathname.replace(/\/index\.html$/, '/');
    const canonicalHref = 'https://esk.psdpro.kz' + normalizedPath;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link){
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  })();

  /* ── Плоский список страниц справочника (для логирования просмотров
     ниже — по нему находим человекочитаемое название текущей страницы)
     строим из общей структуры сайта (site-structure.js), а не храним
     отдельным списком. Файл site-structure.js должен быть подключён
     на странице ДО этого скрипта. ── */
  const SITE_PAGES = [];
  // Разделы с openAccess: true (см. site-structure.js) доступны без входа —
  // собираем их страницы в отдельный набор для гейта авторизации ниже.
  const FREE_ACCESS_PAGES = new Set();
  if (typeof SECTIONS !== 'undefined'){
    SECTIONS.forEach(section => {
      section.items.forEach(entry => {
        if (entry.group){
          entry.items.forEach(it => {
            SITE_PAGES.push({ href: it.href, title: it.title });
            if (section.openAccess) FREE_ACCESS_PAGES.add(it.href);
          });
        } else {
          SITE_PAGES.push({ href: entry.href, title: entry.title });
          if (section.openAccess) FREE_ACCESS_PAGES.add(entry.href);
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
     Тот же набор кнопок, что и в шапке PSD PRO (site-header.js там) —
     "ЭСК" и "Об авторе" ведут на страницы самого справочника, остальные
     уводят на соответствующие страницы PSD PRO. Чтобы перейти в
     содержание справочника — жмут "ЭСК" (это и есть index.html). */
  const NAV_ITEMS = [
    { href: "https://www.psdpro.kz/",              label: "Главная" },
    { href: "https://www.psdpro.kz/raschety.html", label: "Расчёты" },
    { href: "index.html",                          label: "ЭСК" },
    { href: "forum.html",                          label: "Форум" },
    { href: "about.html",                          label: "Об авторе" },
    { href: "https://www.psdpro.kz/contact.html",  label: "Связаться" }
  ];

  const mount = document.getElementById('site-header');
  if (!mount) return;

  const current = location.pathname.split('/').pop() || 'index.html';

  /* ── Собираем HTML навигации ── */
  const navHTML = NAV_ITEMS.map(item => {
    const isCurrent = item.href === current;
    const cls = isCurrent ? ' class="current"' : '';
    return `<a href="${item.href}"${cls}>${item.label}</a>`;
  }).join('<span class="sep">·</span>');

  /* ── Рендерим шапку ── */
  mount.innerHTML = `
    <header class="site-header">
      <div class="site-header-media">
        <img class="site-header-img" src="icons/3.png" alt="Электронный справочник конструктора">
        <div class="site-header-tint"></div>
      </div>
      <div class="site-header-overlay">
        <nav class="site-nav">${navHTML}</nav>
      </div>
      <div class="site-auth" id="siteAuth"></div>
    </header>
  `;

  /* ══════════════════════════════════════════════════════════════
     СЧЁТЧИК "СЕЙЧАС НА САЙТЕ" — временно отключён.
     Бэкенд (/api/presence) и бейдж в шапке пока убраны из показа.
     Чтобы включить обратно — верните <div class="site-online">...</div>
     в разметку выше и код пинга (см. историю правок).
     ══════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════
     АНОНИМНЫЙ СЧЁТЧИК ПРОСМОТРОВ СТРАНИЦ
     Срабатывает при каждом открытии ЛЮБОЙ страницы, независимо от входа —
     в отличие от logPageView() ниже, который считает только вошедших
     пользователей. Пишет в отдельный лист "Просмотры" (см. статистика в
     statistika.html), без привязки к email/пользователю.
     ══════════════════════════════════════════════════════════════ */
  (function(){
    const VIEW_LOG_API_URL = 'https://rebar-backend-henna.vercel.app/api/log-view';
    const pageLabel = document.title.replace(/\s*—\s*Электронный справочник конструктора\s*$/, '').trim() || document.title;
    fetch(VIEW_LOG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageLabel })
    }).catch(function(){});
  })();

  /* ══════════════════════════════════════════════════════════════
     АВТОРИЗАЦИЯ ЧЕРЕЗ FIREBASE AUTHENTICATION
     Способы входа: Google, почта+пароль, ссылка на почту (без пароля).
     Firebase сам хранит сессию в браузере — повторно логиниться на
     каждой странице не нужно. Это не защита данных (сайт статичный),
     а фильтр от случайных посетителей + учёт того, кто пользуется
     справочником.
     ══════════════════════════════════════════════════════════════ */

  // Конфиг проекта Firebase (не секретный, можно хранить в коде открыто)
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAG5WypvPBA2xjM4BuHukq_EelHkSBFrM8",
    authDomain: "esk-kz.firebaseapp.com",
    projectId: "esk-kz",
    storageBucket: "esk-kz.firebasestorage.app",
    messagingSenderId: "943673115707",
    appId: "1:943673115707:web:7d57e67174f4c30bb9481e"
  };
  const USER_LOG_API_URL = 'https://rebar-backend-henna.vercel.app/api/log-user';
  const PAGEVIEW_LOG_API_URL = 'https://rebar-backend-henna.vercel.app/api/log-pageview';
  const EMAIL_LINK_STORAGE_KEY = 'esk_email_for_link'; // почта, ждущая перехода по ссылке из письма

  const authMount = document.getElementById('siteAuth');
  const isCalculatorPage = current !== 'index.html' && current !== 'about.html';
  // ЭСК теперь полностью открытый справочник (интерактивные калькуляторы
  // переехали в PSDPRO, где и остаётся вход по логину) — гейт отключён
  // сайт-wide. FREE_ACCESS_PAGES/openAccess оставлены в site-structure.js
  // и коде ниже нетронутыми на случай, если понадобится вернуть.
  const requiresAuth = false;
  let authGateEl = null;
  let pageViewLogged = false; // чтобы не логировать один и тот же просмотр повторно

  // Отправляем данные на бэкенд для учёта пользователей (не блокирует интерфейс).
  // Вызывается только в момент реального входа/регистрации, а не на
  // каждой странице — иначе счётчик считал бы одного человека много раз.
  // method: 'google' | 'password' | 'link'
  function logUser(user, method){
    fetch(USER_LOG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.displayName || (user.email ? user.email.split('@')[0] : ''),
        email: user.email,
        method: method,
        site: 'ЭСК'
      })
    }).catch(function(){ /* тихо игнорируем — учёт не критичен для работы сайта */ });
  }

  // Логируем просмотр страницы-калькулятора — один раз за загрузку страницы
  function logPageView(user){
    if (pageViewLogged || !user || !user.email) return;
    pageViewLogged = true;
    const pageEntry = SITE_PAGES.find(p => p.href === current);
    const pageLabel = pageEntry ? pageEntry.title : current;
    fetch(PAGEVIEW_LOG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, page: pageLabel, site: 'ЭСК' })
    }).catch(function(){ /* тихо игнорируем */ });
  }

  function renderSignedIn(user){
    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Пользователь');
    authMount.innerHTML = `
      <div class="auth-user">
        ${user.photoURL ? `<img class="auth-avatar" src="${user.photoURL}" alt="${name}">` : ''}
        <span class="auth-name">${name}</span>
        <button class="auth-logout" id="authLogoutBtn" title="Выйти">Выйти</button>
      </div>
    `;
    document.getElementById('authLogoutBtn').addEventListener('click', function(){
      firebase.auth().signOut();
    });
  }

  function renderSignedOut(){
    authMount.innerHTML = `<button type="button" class="auth-login-btn" id="openAuthGateBtn">Войти</button>`;
    const btn = document.getElementById('openAuthGateBtn');
    if (btn) btn.addEventListener('click', showAuthGate);
  }

  function showGateError(msg){
    const el = document.getElementById('authGateError');
    if (el) el.textContent = msg || '';
  }

  // Переводим коды ошибок Firebase в понятные фразы на русском
  function friendlyError(err){
    const map = {
      'auth/invalid-email': 'Некорректная почта.',
      'auth/user-not-found': 'Пользователь с такой почтой не найден.',
      'auth/wrong-password': 'Неверный пароль.',
      'auth/invalid-credential': 'Неверная почта или пароль.',
      'auth/email-already-in-use': 'Эта почта уже зарегистрирована — попробуйте войти.',
      'auth/weak-password': 'Пароль слишком короткий (минимум 6 символов).',
      'auth/popup-closed-by-user': 'Окно входа закрыто.'
    };
    return map[err.code] || ('Ошибка входа: ' + err.message);
  }

  function showAuthGate(){
    if (authGateEl) return;
    document.body.style.overflow = 'hidden';
    authGateEl = document.createElement('div');
    authGateEl.id = 'authGate';
    authGateEl.innerHTML = `
      <div class="auth-gate-box">
        <h2>Доступ к справочнику</h2>
        <p>Войдите, чтобы открыть расчётные материалы справочника.</p>

        <button type="button" class="auth-google-btn" id="authGoogleBtn">Войти через Google</button>

        <div class="auth-divider"><span>или</span></div>

        <div class="auth-tabs">
          <button type="button" class="auth-tab active" data-tab="password">Почта и пароль</button>
          <button type="button" class="auth-tab" data-tab="link">Ссылка на почту</button>
        </div>

        <div class="auth-tab-panel" id="authTabPassword">
          <input type="email" id="authEmailInput" placeholder="Почта" autocomplete="email">
          <input type="password" id="authPasswordInput" placeholder="Пароль" autocomplete="current-password">
          <div class="auth-actions">
            <button type="button" id="authLoginBtn">Войти</button>
            <button type="button" id="authRegisterBtn">Зарегистрироваться</button>
          </div>
          <a href="#" class="auth-gate-admin" id="authForgotLink">Забыли пароль?</a>
        </div>

        <div class="auth-tab-panel" id="authTabLink" style="display:none">
          <input type="email" id="authLinkEmailInput" placeholder="Почта" autocomplete="email">
          <button type="button" id="authSendLinkBtn">Отправить ссылку для входа</button>
          <p class="auth-hint" id="authLinkStatus"></p>
        </div>

        <p class="auth-gate-error" id="authGateError"></p>
        <a class="auth-gate-back" href="index.html">← Вернуться к содержанию</a>
      </div>
    `;
    document.body.appendChild(authGateEl);

    // Переключение вкладок "Почта и пароль" / "Ссылка на почту"
    authGateEl.querySelectorAll('.auth-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        authGateEl.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('authTabPassword').style.display = tab.dataset.tab === 'password' ? 'block' : 'none';
        document.getElementById('authTabLink').style.display = tab.dataset.tab === 'link' ? 'block' : 'none';
        showGateError('');
      });
    });

    // Вход через Google
    document.getElementById('authGoogleBtn').addEventListener('click', function(){
      showGateError('');
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then(function(result){ logUser(result.user, 'google'); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Вход по почте + паролю
    document.getElementById('authLoginBtn').addEventListener('click', function(){
      showGateError('');
      const email = document.getElementById('authEmailInput').value.trim();
      const password = document.getElementById('authPasswordInput').value;
      if (!email || !password) { showGateError('Заполните почту и пароль.'); return; }
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(cred){ logUser(cred.user, 'password'); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Регистрация по почте + паролю
    document.getElementById('authRegisterBtn').addEventListener('click', function(){
      showGateError('');
      const email = document.getElementById('authEmailInput').value.trim();
      const password = document.getElementById('authPasswordInput').value;
      if (!email || !password) { showGateError('Заполните почту и пароль.'); return; }
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(cred){ logUser(cred.user, 'password'); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Забыли пароль
    document.getElementById('authForgotLink').addEventListener('click', function(e){
      e.preventDefault();
      const email = document.getElementById('authEmailInput').value.trim();
      if (!email) { showGateError('Сначала введите почту в поле выше.'); return; }
      firebase.auth().sendPasswordResetEmail(email)
        .then(function(){ showGateError('Письмо для сброса пароля отправлено на ' + email + '.'); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Вход по ссылке на почту (без пароля)
    document.getElementById('authSendLinkBtn').addEventListener('click', function(){
      const email = document.getElementById('authLinkEmailInput').value.trim();
      const statusEl = document.getElementById('authLinkStatus');
      if (!email) { statusEl.textContent = 'Введите почту.'; return; }
      const actionCodeSettings = { url: window.location.href, handleCodeInApp: true };
      firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings).then(function(){
        try { localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email); } catch(e){}
        statusEl.textContent = 'Ссылка отправлена на ' + email + ' — проверьте почту (и папку «Спам»).';
      }).catch(function(err){ statusEl.textContent = friendlyError(err); });
    });
  }

  function hideAuthGate(){
    if (authGateEl){
      authGateEl.remove();
      authGateEl = null;
    }
    document.body.style.overflow = '';
  }

  // Если мы попали на страницу по ссылке из письма — завершаем вход
  function completeEmailLinkSignInIfNeeded(){
    if (!firebase.auth().isSignInWithEmailLink(window.location.href)) return;
    let email = null;
    try { email = localStorage.getItem(EMAIL_LINK_STORAGE_KEY); } catch(e){}
    if (!email){
      email = window.prompt('Подтвердите почту, на которую пришла ссылка:');
    }
    if (!email) return;
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then(function(cred){
        try { localStorage.removeItem(EMAIL_LINK_STORAGE_KEY); } catch(e){}
        window.history.replaceState({}, document.title, window.location.pathname);
        logUser(cred.user, 'link');
      })
      .catch(function(err){ window.alert(friendlyError(err)); });
  }

  if (authMount){
    // Подключаем Firebase SDK (compat-версия — работает через обычные
    // <script> без сборщика и import'ов, как остальной код на сайте)
    function loadScript(src){
      return new Promise(function(resolve, reject){
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const FB_VER = '10.14.1';
    const loadPromise = window.__firebaseSdkLoading || (window.__firebaseSdkLoading =
      loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-app-compat.js`)
        .then(function(){ return loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-auth-compat.js`); })
    );

    loadPromise.then(function(){
      if (!firebase.apps.length){
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      completeEmailLinkSignInIfNeeded();

      firebase.auth().onAuthStateChanged(function(user){
        if (user){
          renderSignedIn(user);
          hideAuthGate();
          if (isCalculatorPage) logPageView(user);
        } else {
          renderSignedOut();
          if (requiresAuth) showAuthGate();
        }
      });
    }).catch(function(err){
      console.error('Не удалось загрузить Firebase SDK:', err);
    });
  }
})();
