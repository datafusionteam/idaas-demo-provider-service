/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  db: {
    host: process.env.DS_DB_HOST,
    user: process.env.DS_DB_USER,
    database: process.env.DS_DB_DATABASE,
    password: process.env.DS_DB_PASSWORD,
    port: process.env.DS_DB_PORT || 5432,
  },
};
