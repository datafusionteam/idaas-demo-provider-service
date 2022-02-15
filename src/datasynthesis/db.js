const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
  user: config.db.user,
  password: config.db.password,
  host: config.db.host,
  database: config.db.database,
  port: config.db.port,
});

module.exports = pool;
