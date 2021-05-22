import rgbToTerm from './rgbToTerm';

export type processOptions = {
  colours: string;
  maxHeight: number;
  maxWidth: number;
  unicode: boolean;
};

const canvas: HTMLCanvasElement = document.createElement('canvas'),
  context: CanvasRenderingContext2D = canvas.getContext(
    '2d'
  ) as CanvasRenderingContext2D;

export const process = (
  image: CanvasImageSource,
  options: processOptions
): string => {
  let imageWidth = image.width as number,
    imageHeight = image.height as number;

  if (imageWidth > options.maxWidth) {
    const scale = imageWidth / options.maxWidth;

    imageWidth = options.maxWidth;
    imageHeight = Math.floor(imageHeight / scale);
  }

  if (imageHeight > options.maxHeight) {
    const scale = imageHeight / options.maxHeight;

    imageHeight = options.maxHeight;
    imageWidth = Math.floor(imageWidth / scale);
  }

  canvas.width = imageWidth;
  canvas.height = imageHeight;

  context.drawImage(image, 0, 0, imageWidth, imageHeight);

  const imageData = context.getImageData(0, 0, imageWidth, imageHeight),
    pixelData = imageData.data;

  let content: string = '';

  // Loop over each pixel and invert the color.
  for (var i = 0, n = pixelData.length, row = 0; i < n; ) {
    if (options.colours === 'true') {
      if (options.unicode) {
        if (
          pixelData[i] === pixelData[i + imageWidth * 4] &&
          pixelData[i + 1] === pixelData[i + 1 + imageWidth * 4] &&
          pixelData[i + 2] === pixelData[i + 2 + imageWidth * 4]
        ) {
          content +=
            '\\e[48;2;' +
            pixelData[i] +
            ';' +
            pixelData[i + 1] +
            ';' +
            pixelData[i + 2] +
            'm ';
        } else {
          if (imageHeight - row === 1) {
            content +=
              '\\e[0m\\e[48;2;' +
              pixelData[i] +
              ';' +
              pixelData[i + 1] +
              ';' +
              pixelData[i + 2] +
              'm ';
          } else {
            content +=
              '\\e[48;2;' +
              pixelData[i] +
              ';' +
              pixelData[i + 1] +
              ';' +
              pixelData[i + 2] +
              'm\\e[38;2;' +
              pixelData[i + imageWidth * 4] +
              ';' +
              pixelData[i + 1 + imageWidth * 4] +
              ';' +
              pixelData[i + 2 + imageWidth * 4] +
              'm▄';
          }
        }

        i += 4;

        if (i && !((i / 4) % imageWidth)) {
          content += '\\e[0m\n';
          i += 4 * imageWidth;
          row += 2;
        }
      } else {
        content +=
          '\\e[48;2;' +
          pixelData[i] +
          ';' +
          pixelData[i + 1] +
          ';' +
          pixelData[i + 2] +
          'm  ';
        i += 4;
        row++;

        if (i && !((i / 4) % imageWidth)) {
          content += '\\e[0m\n';
        }
      }
    } else {
      if (options.unicode) {
        const _bg = rgbToTerm(pixelData[i], pixelData[i + 1], pixelData[i + 2]),
          _fg = rgbToTerm(
            pixelData[i + imageWidth * 4],
            pixelData[i + 1 + imageWidth * 4],
            pixelData[i + 2 + imageWidth * 4]
          );

        if (_bg === _fg) {
          content += '\\e[48;5;' + _bg + 'm ';
        } else {
          if (imageHeight - row === 1) {
            content += '\\e[0m\\e[48;5;' + _bg + 'm ';
          } else {
            content += '\\e[48;5;' + _bg + 'm\\e[38;5;' + _fg + 'm▄';
          }
        }

        i += 4;

        if (i && !((i / 4) % imageWidth)) {
          content += '\\e[0m\n';
          i += 4 * imageWidth;
          row += 2;
        }
      } else {
        content +=
          '\\e[48;5;' +
          rgbToTerm(pixelData[i], pixelData[i + 1], pixelData[i + 2]) +
          'm  ';
        i += 4;
        row++;

        if (i && !((i / 4) % imageWidth)) {
          content += '\\e[0m\n';
        }
      }
    }
  }

  // minimise output, replacing contiguous definitions
  while (content.match(/(\\e\[[\d;]+m)([▄ ]+)\1/g)) {
    content = content.replace(/(\\e\[[\d;]+m)([▄ ]+)\1/g, '$1$2');
  }

  return content;
};

export default process;
