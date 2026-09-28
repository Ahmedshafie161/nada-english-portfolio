const params = new URLSearchParams(window.location.search);
const course = params.get('course') === 'toefl' ? 'TOEFL' : 'IELTS';
const title = document.querySelector('#booking-title');
const courseField = document.querySelector('#application-course');
const ieltsTypeField = document.querySelector('#ielts-type-field');
const form = document.querySelector('#application-form');
const status = document.querySelector('#application-status');

title.innerHTML = `${course} <em>application.</em>`;
courseField.value = course;
if (course === 'TOEFL') ieltsTypeField.hidden = true;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = new FormData(form).get('name');
  status.textContent = `Thank you${name ? `, ${name}` : ''}. Your ${course} application is ready to send.`;
  form.reset();
  courseField.value = course;
});
