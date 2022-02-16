/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const { Kafka, logLevel } = require("kafkajs");

const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env;
const sasl =
  username && password ? { username, password, mechanism: "plain" } : null;
const ssl = !!sasl;

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: "pinnacle-chiro-provider-service",
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  logLevel: logLevel.ERROR,
  ssl,
  sasl,
  retry: {
    retries: 10,
    initialRetryTime: 100,
  },
});

module.exports = kafka;
