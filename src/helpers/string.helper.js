const {
  titleCase,
  lowerCase,
  sentenceCase,
  capitalCase,
} = require("text-case");
const { toSwahili } = require("digits-to-swahili");

module.exports = {
  titleCase: (text) => titleCase(text),
  lowerCase: (text) => lowerCase(text),
  sentenceCase: (text) => sentenceCase(text),
  capitalCase: (text) => capitalCase(text),
  numberToWord: toSwahili,
};
