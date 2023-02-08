/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { Kafka, logLevel } = require("kafkajs");

const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env;
const sasl =
  username && password ? { username, password, mechanism: "plain" } : null;
const ssl = !!sasl;

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: "dfs-chiro-provider-service",
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  logLevel: logLevel.INFO,
  ssl,
  sasl,
  retry: {
    retries: 10,
    initialRetryTime: 100,
  },
});

module.exports = kafka;
