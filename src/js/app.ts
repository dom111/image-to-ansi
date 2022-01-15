import readImage, { loadImage } from './readImage';
import process from './process';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import 'bootstrap/dist/js/bootstrap.bundle.min';

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

  navigator.clipboard.writeText(
    (contentElement as HTMLElement).innerText.replace(/\x1b/g, '\\e')
  );
});

const fileButton = document.querySelector('.parser .btn') as HTMLLabelElement,
  fileInput = fileButton.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement,
  spinner = fileButton.querySelector('.spinner-border') as HTMLSpanElement,
  urlInput = document.querySelector('input[type="url"]') as HTMLInputElement,
  errorContainer = document.querySelector('.error-container') as HTMLDivElement,
  errorContent = errorContainer.querySelector(
    '.error-content'
  ) as HTMLDivElement,
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
  terminal = new Terminal({
    convertEol: true,
    theme: {
      background: '#272822',
      cursor: 'transparent',
      foreground: '#f8f8f2',
    },
  }),
  fit = new FitAddon(),
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

        terminal.reset();
        terminal.write(ansiEscape);
        copyPaste.innerText = `printf "${ansiEscape.replace(/\x1b/g, '\\e')}";`;

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

      return;
    }

    requestAnimationFrame(done);
  };

terminal.loadAddon(fit);
terminal.open(document.querySelector('div.terminal') as HTMLDivElement);

fit.fit();

window.addEventListener('resize', () => fit.fit());

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
  input.addEventListener('input', () => {
    fileButton.classList.add('disabled');
    urlInput.setAttribute('disabled', '');
    spinner.classList.remove('d-none');

    generate(() => {
      fileButton.classList.remove('disabled');
      urlInput.removeAttribute('disabled');
      spinner.classList.add('d-none');
    });
  })
);
