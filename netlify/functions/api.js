const serverless = require("serverless-http");
const app = require("../../backend/app.js");

exports.handler = serverless(app);