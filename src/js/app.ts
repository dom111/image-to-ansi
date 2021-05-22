import readImage from './readImage';

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
  spinner = fileButton.querySelector('.spinner-border') as HTMLSpanElement,
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
  generate = (done: () => void = () => {}) => {
    const file = fileInput?.files?.[0];

    if (!file) {
      done();

      return;
    }

    readImage(file, {
      colours: coloursInputs.reduce((value: string, el) => {
        if (el.checked) {
          return el.value;
        }

        return value;
      }, '256'),
      maxHeight: parseInt(maxHeightInput.value, 10),
      maxWidth: parseInt(maxWidthInput.value, 10),
      unicode: unicodeInput.checked,
    })
      .then((ansiEscape) => {
        terminalPreview.innerText = ansiEscape;
        copyPaste.innerText = `printf "${ansiEscape}";`;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        done();
      });
  };

[
  ...coloursInputs,
  maxHeightInput,
  maxWidthInput,
  unicodeInput,
  fileInput,
].forEach((input) =>
  input.addEventListener('input', () => {
    fileButton.classList.add('disabled');
    spinner.classList.remove('d-none');

    generate(() => {
      fileButton.classList.remove('disabled');
      spinner.classList.add('d-none');
    });
  })
);
