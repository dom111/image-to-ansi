declare type Colour = [number, number, number];
declare type TermColour = [...Colour, number];

const colours: TermColour[] = [],
  buildColours = (): void => {
    colours.push([0, 0, 0, 0]);
    colours.push([128, 0, 0, 1]);
    colours.push([0, 128, 0, 2]);
    colours.push([128, 128, 0, 3]);
    colours.push([0, 0, 128, 4]);
    colours.push([128, 0, 128, 5]);
    colours.push([0, 128, 128, 6]);
    colours.push([192, 192, 192, 7]);
    colours.push([128, 128, 128, 8]);
    colours.push([255, 0, 0, 9]);
    colours.push([0, 255, 0, 10]);
    colours.push([255, 255, 0, 11]);
    colours.push([0, 0, 255, 12]);
    colours.push([255, 0, 255, 13]);
    colours.push([0, 255, 255, 14]);
    colours.push([255, 255, 255, 15]);

    [0, 95, 135, 175, 215, 255].forEach((r): void => {
      [0, 95, 135, 175, 215, 255].forEach((g): void => {
        [0, 95, 135, 175, 215, 255].forEach((b): void => {
          colours.push([
            r,
            g,
            b,
            16 +
              parseInt(
                '' +
                  Math.floor((r / 255) * 5) +
                  Math.floor((g / 255) * 5) +
                  Math.floor((b / 255) * 5),
                6
              ),
          ]);
        });
      });
    });

    [
      8, 18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168,
      178, 188, 198, 208, 218, 228, 238,
    ].forEach((s): void => {
      colours.push([s, s, s, 232 + Math.floor(s / 10)]);
    });
  },
  best = (candidates: TermColour[], source: Colour): TermColour =>
    [...candidates]
      .sort(
        (x, y): number =>
          Math.abs(x[0] - source[0]) +
            Math.abs(x[1] - source[1]) +
            Math.abs(x[2] - source[2]) -
            (Math.abs(y[0] - source[0]) +
              Math.abs(y[1] - source[1]) +
              Math.abs(y[2] - source[2])) || x[3] - y[3] // prefer lower colour numbers
      )
      .shift() || [0, 0, 0, 0];

export const rgbToTerm = (r: number, g: number, b: number) => {
  if (!colours.length) {
    buildColours();
  }

  return (best(colours, [r, g, b]) || [])[3];
};

export default rgbToTerm;
