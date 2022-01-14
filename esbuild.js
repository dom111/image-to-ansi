const { sassPlugin } = require('esbuild-sass-plugin'),
  { Prettier } = require('esbuild-plugin-prettier'),
  { build } = require('esbuild'),
  path = require('path');

process.stdout.write(`Building... `);

build({
    entryNames: '[dir]/[name]',
    entryPoints: ['src/js/app.ts', 'src/css/app.scss'],
    bundle: true,
    minify: true,
    sourcemap: true,
    watch: process.argv.includes('watch') ? {
        onRebuild(error, result) {
            if (error) {
                console.log('\x1b[31mError rebuilding:\x1b[0m');
                console.error(error);

                return;
            }

            console.log('\x1b[32mRebuilt.\x1b[0m');
        },
    } : false,
    outdir: 'dist',
    plugins: [
        sassPlugin({
            includePaths: [
                path.resolve(__dirname, "node_modules"),
            ]
        }),
        new Prettier(),
    ],
})
  .then(() => {
    console.log('\x1b[32mdone.\x1b[0m');
  })
  .catch((e) => {
    console.log(`\x1b[31mfailed.\x1b[0m`);
    console.log('');
    console.error(e);

    process.exit(1);
  });
