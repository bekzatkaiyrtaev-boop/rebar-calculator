/* ══════════════════════════════════════════════════════════════
   ОБЩИЙ ФУТЕР САЙТА — логика
   Подключается одинаково на каждой странице справочника:
     <div id="site-footer"></div>
     <script src="site-footer.js"></script>

   Сейчас футер пустой (зарезервировано место с рамкой сверху).
   Чтобы добавить контакты/ссылки — впишите их в CONTACTS ниже,
   правки применятся сразу на всех страницах, где подключён скрипт.

   Пример:
   const CONTACTS = [
     { label: "Почта",    href: "mailto:info@site.kz",  text: "info@site.kz" },
     { label: "Telegram", href: "https://t.me/username", text: "@username" },
     { label: "WhatsApp", href: "https://wa.me/7XXXXXXXXXX", text: "+7 XXX XXX XX XX" }
   ];
   ══════════════════════════════════════════════════════════════ */

(function(){

  /* ── Контакты (пока пусто) ── */
  const CONTACTS = [];

  /* ── Копирайт-строка (пусто = не показывается) ──
     Пример: const COPYRIGHT = "© 2026 Электронный справочник конструктора"; */
  const COPYRIGHT = "";

  const mount = document.getElementById('site-footer');
  if (!mount) return;

  const contactsHTML = CONTACTS.length
    ? `<div class="footer-contacts">${CONTACTS.map(c =>
        `<a href="${c.href}">${c.label}: ${c.text}</a>`
      ).join('<span class="sep">·</span>')}</div>`
    : '';

  const copyHTML = COPYRIGHT ? `<div class="footer-copy">${COPYRIGHT}</div>` : '';

  mount.innerHTML = `<footer class="site-footer">${contactsHTML}${copyHTML}</footer>`;
})();
