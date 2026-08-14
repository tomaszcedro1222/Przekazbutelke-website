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

  const bindCounterButton = (button, step) => {
    if ('PointerEvent' in window) {
      button.addEventListener('pointerup', (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        updateCounter(value + step);
      });

      button.addEventListener('click', (event) => {
        if (event.detail === 0) updateCounter(value + step);
      });
      return;
    }

    button.addEventListener('click', () => updateCounter(value + step));
  };

  bindCounterButton(decreaseButton, -1);
  bindCounterButton(increaseButton, 1);
  updateCounter(value);
});
