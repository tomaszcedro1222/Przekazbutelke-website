document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => menu.removeAttribute('open'));
    });
  }

  const receiverFlow = document.querySelector('.receiver-flow');
  const receiverDots = Array.from(document.querySelectorAll('[data-receiver-slide]'));
  if (receiverFlow && receiverDots.length) {
    const receiverScreens = Array.from(receiverFlow.querySelectorAll('.flow-screen'));
    let scrollFrame;

    const setActiveReceiverDot = (activeIndex) => {
      receiverDots.forEach((dot, index) => {
        if (index === activeIndex) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    const updateReceiverDot = () => {
      const flowCenter = receiverFlow.scrollLeft + receiverFlow.clientWidth / 2;
      let activeIndex = 0;
      let smallestDistance = Infinity;

      receiverScreens.forEach((screen, index) => {
        const screenCenter = screen.offsetLeft + screen.offsetWidth / 2;
        const distance = Math.abs(screenCenter - flowCenter);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          activeIndex = index;
        }
      });

      setActiveReceiverDot(activeIndex);
    };

    receiverFlow.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(updateReceiverDot);
    }, { passive: true });

    receiverDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const screen = receiverScreens[index];
        const targetLeft = screen.offsetLeft - (receiverFlow.clientWidth - screen.offsetWidth) / 2;
        receiverFlow.scrollTo({ left: targetLeft, behavior: 'smooth' });
        setActiveReceiverDot(index);
      });
    });

    updateReceiverDot();
  }

  const counter = document.querySelector('[data-bottle-counter]');
  if (!counter) return;

  const valueElement = counter.querySelector('[data-counter-value]');
  const decreaseButton = counter.querySelector('[data-counter-decrease]');
  const increaseButton = counter.querySelector('[data-counter-increase]');
  const submitButton = counter.querySelector('[data-counter-submit]');
  const resetButton = counter.querySelector('[data-counter-reset]');
  const entryLabel = counter.getAttribute('aria-label');
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

    window.setTimeout(() => {
      counter.classList.add('is-complete');
      counter.setAttribute('aria-label', 'Potwierdzenie dodania punktu z opakowaniami');
      resetButton.disabled = false;
    }, 110);
    window.setTimeout(() => counter.classList.remove('is-transitioning'), 650);
  };

  const showEntryScreen = () => {
    if (!counter.classList.contains('is-complete') || counter.classList.contains('is-transitioning')) return;

    counter.classList.add('is-transitioning');
    resetButton.disabled = true;

    window.setTimeout(() => {
      counter.classList.remove('is-complete');
      counter.setAttribute('aria-label', entryLabel);
      submitButton.disabled = false;
    }, 110);
    window.setTimeout(() => counter.classList.remove('is-transitioning'), 650);
  };

  bindFastAction(decreaseButton, () => updateCounter(value - 1));
  bindFastAction(increaseButton, () => updateCounter(value + 1));
  bindFastAction(submitButton, showSuccessScreen);
  bindFastAction(resetButton, showEntryScreen);
  updateCounter(value);
});
