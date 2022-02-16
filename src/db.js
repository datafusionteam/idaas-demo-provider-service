/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { Pool, Client } = require("pg");
const config = require("./config");

const pool = new Pool({
  user: config.db.user,
  password: config.db.password,
  host: config.db.host,
  database: config.db.database,
  port: config.db.port,
});

const client = new Client({
  user: config.db.user,
  password: config.db.password,
  host: config.db.host,
  database: config.db.database,
  port: config.db.port,
});

module.exports = { client, pool };
