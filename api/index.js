// Vercel serverless entry point — the whole Express app runs as one function.
//
// TEMPORARY DIAGNOSTIC MODE: if the app fails to load, the error is returned
// in the response body instead of crashing the function opaquely. Remove the
// try/catch wrapper once the deployment is stable.
let app = null;
let initError = null;
try {
  app = require('../server');
} catch (err) {
  initError = err;
  console.error('[api] App failed to load:', err);
}

module.exports = (req, res) => {
  if (initError) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.end('APP INIT ERROR:\n' + (initError.stack || String(initError)));
  }
  return app(req, res);
};

// Vercel's default body parser would consume the request stream before
// Express sees it, breaking the raw-body HMAC verification on
// /razorpay-webhook. The app does its own body parsing.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
