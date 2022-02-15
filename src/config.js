// Single source to handle all the env vars
module.exports = {
  hapiFhir: {
    host: process.env.HAPI_FHIR_HOST,
    port: process.env.HAPI_FHIR_PORT || 8080,
  },
  idaasConnectUrl: process.env.IDAAS_CONNECT_URL || "idaas-connect:9982",
  kafkaTopic: process.env.KAFKA_TOPIC || "fhirsvr_appointment",
  oauth: {
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  },
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  },
};
