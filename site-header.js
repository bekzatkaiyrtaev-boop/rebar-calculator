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
  const EMAIL_LINK_STORAGE_KEY = 'esk_email_for_link'; // почта, ждущая перехода по ссылке из письма

  const authMount = document.getElementById('siteAuth');
  const isCalculatorPage = current !== 'index.html' && current !== 'about.html';
  let authGateEl = null;

  // Отправляем данные на бэкенд для учёта пользователей (не блокирует интерфейс).
  // Вызывается только в момент реального входа/регистрации, а не на
  // каждой странице — иначе счётчик считал бы одного человека много раз.
  function logUser(user){
    fetch(USER_LOG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.displayName || (user.email ? user.email.split('@')[0] : ''),
        email: user.email,
        picture: user.photoURL || ''
      })
    }).catch(function(){ /* тихо игнорируем — учёт не критичен для работы сайта */ });
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
        .then(function(result){ logUser(result.user); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Вход по почте + паролю
    document.getElementById('authLoginBtn').addEventListener('click', function(){
      showGateError('');
      const email = document.getElementById('authEmailInput').value.trim();
      const password = document.getElementById('authPasswordInput').value;
      if (!email || !password) { showGateError('Заполните почту и пароль.'); return; }
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(cred){ logUser(cred.user); })
        .catch(function(err){ showGateError(friendlyError(err)); });
    });

    // Регистрация по почте + паролю
    document.getElementById('authRegisterBtn').addEventListener('click', function(){
      showGateError('');
      const email = document.getElementById('authEmailInput').value.trim();
      const password = document.getElementById('authPasswordInput').value;
      if (!email || !password) { showGateError('Заполните почту и пароль.'); return; }
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(cred){ logUser(cred.user); })
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
        logUser(cred.user);
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
        } else {
          renderSignedOut();
          if (isCalculatorPage) showAuthGate();
        }
      });
    }).catch(function(err){
      console.error('Не удалось загрузить Firebase SDK:', err);
    });
  }
})();
