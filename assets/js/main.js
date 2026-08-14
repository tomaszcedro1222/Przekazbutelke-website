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
  const submitButton = counter.querySelector('[data-counter-submit]');
  let value = Number(valueElement.textContent) || 5;

  const updateCounter = (nextValue) => {
    value = Math.min(99, Math.max(1, nextValue));
    valueElement.textContent = value;
    decreaseButton.disabled = value === 1;
    increaseButton.disabled = value === 99;
  };

  const bindFastAction = (button, action) => {
    if ('PointerEvent' in window) {
      button.addEventListener('pointerup', (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        action();
      });

      button.addEventListener('click', (event) => {
        if (event.detail === 0) action();
      });
      return;
    }

    button.addEventListener('click', action);
  };

  const showSuccessScreen = () => {
    if (counter.classList.contains('is-complete') || counter.classList.contains('is-transitioning')) return;

    counter.classList.add('is-transitioning');
    submitButton.disabled = true;

    window.setTimeout(() => counter.classList.add('is-complete'), 110);
    window.setTimeout(() => counter.classList.remove('is-transitioning'), 650);
  };

  bindFastAction(decreaseButton, () => updateCounter(value - 1));
  bindFastAction(increaseButton, () => updateCounter(value + 1));
  bindFastAction(submitButton, showSuccessScreen);
  updateCounter(value);
});
