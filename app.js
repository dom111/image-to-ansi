(function($) {
    var ImageToANSI = (function() {
        var _readImage = function(file, callback) {
            var reader = new FileReader();
            reader.onload = function(e) {
                if (e && e.target && e.target.result) {
                    _image.onload = function() {};
                    _image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEUAAACnej3aAAAAAXRSTlPHReaPdQAAAApJREFUCNdjwAsAAB4AAdpxxYoAAAAASUVORK5CYII=';
                    _image.onload = function() {
                        _process();

                        if (callback) {
                            try {
                                callback();
                            } catch (e) {
                                // 
                            }
                        }
                    };
                    _image.src = event.target.result;
                }
                else {
                    // TODO: error
                    console.error('_readImage: No file.', e);
                }
            };

            reader.readAsDataURL(file);
        },
        _process = function() {
            var destWidth = _image.width,
            destHeight = _image.height,
            content = '',
            scale,
            imageData,
            pixelData;

            if (destWidth > _options.width) {
                scale = destWidth / _options.width;
                destWidth = _options.width;
                destHeight = Math.floor(destHeight / scale);
            }

            _canvas.width = destWidth;
            _canvas.height = destHeight;
            _context.drawImage(_image, 0, 0, destWidth, destHeight);

            imageData = _context.getImageData(0, 0, destWidth, destHeight);
            pixelData = imageData.data;

            // Loop over each pixel and invert the color.
            for (var i = 0, n = pixelData.length, row = 0; i < n; ) {
                if (_options.colours === 'true') {
                    if (_options.unicode) {
                        var _bg = _rgbToTerm(pixelData[i], pixelData[i + 1], pixelData[i + 2]),
                        _fg = _rgbToTerm(pixelData[i + (destWidth * 4)], pixelData[i + 1 + (destWidth * 4)], pixelData[i + 2 + (destWidth * 4)]);

                        if ((pixelData[i] == pixelData[i + (destWidth * 4)]) && (pixelData[i + 1] == pixelData[i + 1 + (destWidth * 4)]) && (pixelData[i + 2] == pixelData[i + 2 + (destWidth * 4)])) {
                            content += '\\e[48;2;' + pixelData[i] + ';' + pixelData[i + 1] + ';' + pixelData[i + 2] + 'm ';
                        }
                        else {
                            if ((destHeight - row) === 1) {
                                content += '\\e[0m\\e[48;2;' + pixelData[i] + ';' + pixelData[i + 1] + ';' + pixelData[i + 2] + 'm ';
                            }
                            else {
                                content += '\\e[48;2;' + pixelData[i] + ';' + pixelData[i + 1] + ';' + pixelData[i + 2] + 'm\\e[38;2;' + pixelData[i + (destWidth * 4)] + ';' + pixelData[i + 1 + (destWidth * 4)] + ';' + pixelData[i + 2 + (destWidth * 4)] + 'm▄';
                            }
                        }

                         i += 4;

                        if (i && !((i / 4) % destWidth)) {
                            content += '\\e[0m\n';
                            i += (4 * destWidth);
                            row += 2;
                        }
                    }
                    else {
                        content += '\\e[48;2;' + pixelData[i] + ';' + pixelData[i + 1] + ';' + pixelData[i + 2] + 'm  ';
                        i += 4;
                        row++;

                        if (i && !((i / 4) % destWidth)) {
                            content += '\\e[0m\n';
                        }
                    }
                }
                else {
                    if (_options.unicode) {
                        var _bg = _rgbToTerm(pixelData[i], pixelData[i + 1], pixelData[i + 2]),
                        _fg = _rgbToTerm(pixelData[i + (destWidth * 4)], pixelData[i + 1 + (destWidth * 4)], pixelData[i + 2 + (destWidth * 4)]);

                        if (_bg == _fg) {
                            content += '\\e[48;5;' + _bg + 'm ';
                        }
                        else {
                            if ((destHeight - row) === 1) {
                                content += '\\e[0m\\e[48;5;' + _bg + 'm ';
                            }
                            else {
                                content += '\\e[48;5;' + _bg + 'm\\e[38;5;' + _fg + 'm▄';
                            }
                        }

                         i += 4;

                        if (i && !((i / 4) % destWidth)) {
                            content += '\\e[0m\n';
                            i += (4 * destWidth);
                            row += 2;
                        }
                    }
                    else {
                        content += '\\e[48;5;' + _rgbToTerm(pixelData[i], pixelData[i + 1], pixelData[i + 2]) + 'm  ';
                        i += 4;
                        row++;

                        if (i && !((i / 4) % destWidth)) {
                            content += '\\e[0m\n';
                        }
                    }
                }
            }

            $('pre.parsed').html(parse(content + '\\e[0m\n'));
            $('pre.copy-paste .contents').html(content);
        },
        _getOptions = function() {
            $('.options').find('input').each(function() {
                _options[$(this).attr('name')] = false;
            });

            $('.options').find('input:checked, input[type="text"]').each(function() {
                _options[$(this).attr('name')] = $(this).val();
            });
        },
        _bindEvents = function() {
            $('[type="file"]').on('change', function(e) {
                $('.panel-heading h2').addClass('loading');

                if (e && e.target && e.target.files && e.target.files[0]) {
                    setTimeout(function() {
                        _readImage(e.target.files[0], function() {
                            $('.panel-heading h2').removeClass('loading');
                        });
                    }, 1);
                }
                else {
                    $('.panel-heading h2').removeClass('loading');
                }
            });

            $('.options').find('input').on('change', function() {
                $('.options h3').addClass('loading');

                _getOptions();

                if (_image.width) {
                    setTimeout(function() {
                        _process();

                        $('.options h3').removeClass('loading');
                    }, 1);
                }
                else {
                    $('.options h3').removeClass('loading');
                }
            });
        },
        _rgbToTerm = function(r, g, b) {
            var _buildColours = function() {
                _colours.push([0, 0, 0, 0]);
                _colours.push([128, 0, 0, 1]);
                _colours.push([0, 128, 0, 2]);
                _colours.push([128, 128, 0, 3]);
                _colours.push([0, 0, 128, 4]);
                _colours.push([128, 0, 128, 5]);
                _colours.push([0, 128, 128, 6]);
                _colours.push([192, 192, 192, 7]);
                _colours.push([128, 128, 128, 8]);
                _colours.push([255, 0, 0, 9]);
                _colours.push([0, 255, 0, 10]);
                _colours.push([255, 255, 0, 11]);
                _colours.push([0, 0, 255, 12]);
                _colours.push([255, 0, 255, 13]);
                _colours.push([0, 255, 255, 14]);
                _colours.push([255, 255, 255, 15]);

                [0, 95, 135, 175, 215, 255].forEach(function(r) {
                    [0, 95, 135, 175, 215, 255].forEach(function(g) {
                        [0, 95, 135, 175, 215, 255].forEach(function(b) {
                            _colours.push([r, g, b, 16 + parseInt('' + Math.floor((r / 255) * 5) + Math.floor((g / 255) * 5) + Math.floor((b / 255) * 5), 6)]);
                        });
                    });
                });

                [8, 18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168, 178, 188, 198, 208, 218, 228, 238].forEach(function(s) {
                    _colours.push([s, s, s, 232 + Math.floor(s / 10)]);
                });
            },
            _best = function(candidates, source) {
                return candidates.slice(0).sort(function(x, y) {
                    return (Math.abs(x[0] - source[0]) + Math.abs(x[1] - source[1]) + Math.abs(x[2] - source[2])) - (Math.abs(y[0] - source[0]) + Math.abs(y[1] - source[1]) + Math.abs(y[2] - source[2])) || (x[3] - y[3]); // prefer lower colour numbers
                })[0];
            };

            if (!_colours.length) {
                _buildColours();
            }

            return (_best(_colours, [r, g, b]) || [])[3];
        },

        _colours = [],
        _options = {},

        _image = new Image(),
        _canvas = document.createElement('canvas'),
        _context = _canvas.getContext('2d');

        $(function() {
            _getOptions();
            _bindEvents();

            new Clipboard('a.copy');
        });

        return _readImage;
    })();
})(jQuery);
