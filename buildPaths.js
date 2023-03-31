const path = require('path');
const buildPaths = {
   buildPathHtml: path.resolve('./build.ejs'),
   buildPathPdf: path.resolve('./build.pdf')
};
module.exports = buildPaths;