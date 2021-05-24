import readImage, { loadImage } from './readImage';
import process from './process';

declare var parse: (s: string) => string;

document.addEventListener('click', (event): void => {
  const eventTarget = event.target;

  if (!(eventTarget instanceof HTMLElement)) {
    return;
  }

  if (!eventTarget.matches('a.copy')) {
    return;
  }

  event.preventDefault();

  const target = eventTarget.dataset.clipboardTarget ?? null;

  if (!target) {
    return;
  }

  const contentElement = document.querySelector(target);

  if (!contentElement) {
    return;
  }

  navigator.clipboard.writeText((contentElement as HTMLElement).innerText);
});

const fileButton = document.querySelector('.parser .btn') as HTMLLabelElement,
  fileInput = fileButton.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement,
  urlContainer = document.querySelector('.url-container') as HTMLDivElement,
  urlInput = document.querySelector('input[type="url"]') as HTMLInputElement,
  errorContainer = document.querySelector('.error-container') as HTMLDivElement,
  errorContent = errorContainer.querySelector(
    '.error-content'
  ) as HTMLDivElement,
  optionsSection = document.querySelector('.options') as HTMLElement,
  coloursInputs = Array.from(
    document.querySelectorAll('input[name="colours"]')
  ) as HTMLInputElement[],
  maxHeightInput = document.querySelector(
    'input[name="maxHeight"]'
  ) as HTMLInputElement,
  maxWidthInput = document.querySelector(
    'input[name="maxWidth"]'
  ) as HTMLInputElement,
  unicodeInput = document.querySelector(
    'input[name="unicode"]'
  ) as HTMLInputElement,
  terminalPreview = document.querySelector('pre.terminal') as HTMLPreElement,
  copyPaste = document.querySelector('pre.copy-paste code') as HTMLElement,
  displayError = (error: string = '') => {
    if (error === '') {
      errorContainer.classList.add('d-none');
      errorContent.innerText = '';

      return;
    }

    errorContainer.classList.remove('d-none');
    errorContent.innerText = error;
  },
  processImage = (url: string, done: () => void = () => {}): Promise<void> =>
    loadImage(url)
      .then((image) => {
        const ansiEscape = process(image, {
          colours: coloursInputs.reduce((value: string, el) => {
            if (el.checked) {
              return el.value;
            }

            return value;
          }, '256'),
          maxHeight: parseInt(maxHeightInput.value, 10),
          maxWidth: parseInt(maxWidthInput.value, 10),
          unicode: unicodeInput.checked,
        });

        terminalPreview.innerText = ansiEscape;
        copyPaste.innerText = `printf "${ansiEscape}";`;

        displayError('');
      })
      .catch((e) => displayError(e.message))
      .finally(() => done()),
  generate = (done: () => void = () => {}) => {
    const file = fileInput?.files?.[0],
      url = urlInput.value;

    if (file) {
      readImage(file)
        .then((url) => processImage(url, done))
        .catch((e) => displayError(e.message));

      return;
    }

    if (url) {
      processImage(url, done);
    }

    done();
  };

fileInput.addEventListener('input', () => {
  urlInput.value = '';
});

urlInput.addEventListener('input', (event) => {
  if (!urlInput.reportValidity() || urlInput.value === '') {
    event.stopImmediatePropagation();

    return;
  }

  fileInput.value = '';
});

[
  ...coloursInputs,
  maxHeightInput,
  maxWidthInput,
  unicodeInput,
  fileInput,
  urlInput,
].forEach((input) =>
  input.addEventListener('input', ({ target }) => {
    requestAnimationFrame(() =>
      [fileButton, urlContainer, optionsSection].forEach((el) =>
        el.classList.add('loading')
      )
    );

    generate(() => {
      [fileButton, urlContainer, optionsSection].forEach((el) =>
        el.classList.remove('loading')
      );

      if (target === urlInput) {
        urlInput.focus();
      }
    });
  })
);
