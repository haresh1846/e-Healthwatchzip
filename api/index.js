// Vercel serverless entry point — the whole Express app runs as one function.
const app = require('../server');

module.exports = app;

// Vercel's default body parser would consume the request stream before
// Express sees it, breaking the raw-body HMAC verification on
// /razorpay-webhook. The app does its own body parsing.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
