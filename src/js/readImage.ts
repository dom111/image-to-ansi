import { process, processOptions } from './process';

export const readImage = (
  file: File,
  options: processOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(),
      image = new Image();

    reader.addEventListener('load', (event) => {
      const result = event?.target?.result as string;

      if (!result) {
        console.error('readImage: No file.', event);

        return;
      }

      image.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEUAAACnej3aAAAAAXRSTlPHReaPdQAAAApJREFUCNdjwAsAAB4AAdpxxYoAAAAASUVORK5CYII=';

      image.addEventListener('load', () => {
        try {
          resolve(process(image, options));
        } catch (e) {
          reject(e);
        }
      });

      image.src = result;
    });

    reader.readAsDataURL(file);
  });
};

export default readImage;
