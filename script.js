const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');

menuToggle?.addEventListener('click', () => {
  const isOpen = siteHeader.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.desktop-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open menu');
  });
});

document.querySelectorAll('[data-program-card]').forEach((card) => {
  card.querySelectorAll('.duration-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      card.querySelectorAll('.duration-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      card.querySelector('.duration-label').textContent = tab.dataset.duration === '3-months' ? '3 months' : '1 month';
    });
  });
});

const bookingForm = document.querySelector('#booking-form');
const formStatus = document.querySelector('#form-status');

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#name').value.trim();
  formStatus.textContent = `Thank you${name ? `, ${name}` : ''} — your inquiry is ready to send.`;
  bookingForm.reset();
});
