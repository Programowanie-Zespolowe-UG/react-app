'use strict';
const path = require('path');
const opentype = require('opentype.js');
const charPreset = require('./char-preset');

let font, ascender, descender;
try {
  // Try default path, but don't crash if it fails (e.g. Next.js bundle)
  const fontPath = path.join(__dirname, '../fonts/Comismsh.ttf');
  font = opentype.loadSync(fontPath);
  ascender = font.ascender;
  descender = font.descender;
} catch (e) {
  // console.warn('SVG-Captcha: Failed to load default font, please call loadFont() manually.');
}

const options = {
	width: 150,
	height: 50,
	noise: 1,
	color: false,
	background: '',
	size: 4,
	ignoreChars: '',
	fontSize: 56,
	charPreset, font, ascender, descender
};

const loadFont = filepath => {
	const font = opentype.loadSync(filepath);
	options.font = font;
	options.ascender = font.ascender;
	options.descender = font.descender;
};

module.exports = {
	options, loadFont
};
