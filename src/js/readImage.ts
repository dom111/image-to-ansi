export const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      const result = event?.target?.result as string;

      if (!result) {
        reject(new TypeError('readImage: No file.'));

        return;
      }

      resolve(result);
    });

    reader.readAsDataURL(file);
  });

export const loadImage = (url: string): Promise<CanvasImageSource> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEUAAACnej3aAAAAAXRSTlPHReaPdQAAAApJREFUCNdjwAsAAB4AAdpxxYoAAAAASUVORK5CYII=';

    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () =>
      reject(new Error(`Error loading image from URL: '${url}'.`))
    );

    try {
      image.setAttribute('crossOrigin', 'Anonymous');
      image.src = url;
    } catch (e) {
      reject(e);
    }
  });

export default readImage;
