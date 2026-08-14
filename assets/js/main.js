document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => menu.removeAttribute('open'));
    });
  }

  const counter = document.querySelector('[data-bottle-counter]');
  if (!counter) return;

  const valueElement = counter.querySelector('[data-counter-value]');
  const decreaseButton = counter.querySelector('[data-counter-decrease]');
  const increaseButton = counter.querySelector('[data-counter-increase]');
  let value = Number(valueElement.textContent) || 5;

  const updateCounter = (nextValue) => {
    value = Math.min(99, Math.max(1, nextValue));
    valueElement.textContent = value;
    decreaseButton.disabled = value === 1;
    increaseButton.disabled = value === 99;
  };

  decreaseButton.addEventListener('click', () => updateCounter(value - 1));
  increaseButton.addEventListener('click', () => updateCounter(value + 1));
  updateCounter(value);
});
