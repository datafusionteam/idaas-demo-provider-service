/*
 * (C) Copyright Data Fusion Specialists. 2022
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Single source to handle all the env vars
module.exports = {
  hapiFhirUrl: process.env.HAPI_FHIR_URL || "http://hapi-fhir:80",
  idaasConnectUrl: process.env.IDAAS_CONNECT_URL || "http://idaas-connect:80",
  kafkaTopic: process.env.KAFKA_TOPIC || "fhirsvr_appointment",
  oauth: {
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  },
  port: process.env.PORT || 8080,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  },
};
