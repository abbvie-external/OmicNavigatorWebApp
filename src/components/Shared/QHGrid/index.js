/* eslint-disable */
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./qhgrid.cjs.production.min.js');
} else {
  module.exports = require('./qhgrid.cjs.development.js');
}
