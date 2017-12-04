'use strict';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const lib = require('./lib.js')

module.exports.hello = (event, context, callback) => {
  lib(event.body).then((data) => {
    const response = {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({
        url: data,
        safed: "nothing"
      }),
    };
    console.log(data)
    callback(null, response);
  })
};
