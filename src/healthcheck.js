#!/usr/bin/env node

const request = require("http").request(
  {
    host: "localhost",
    port: process.env.PORT || 8080,
    timeout: 1000,
    path: "/healthz",
  },
  (res) => {
    process.exit(res.statusCode === 200 ? 0 : 1);
  }
);

request.on("error", () => {
  process.exit(1);
});

request.end();
