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

const kafka = require("./kafka");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const cron = require("node-cron");
const config = require("./config");
const { refreshTokens } = require("./oauth");
const createApi = require("./api");
const { FHIRServer } = require("./fhir");
const logger = require("./logger");

const Topics = {
  FHIRAppointment: "fhirsvr_appointment",
};

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
});

const processMessage = async (topic, partition, key, value) => {
  switch (topic) {
    case Topics.FHIRAppointment:
      await handleAppointmentReceived(value);
      break;
    default:
      break;
  }
};

const handleAppointmentReceived = async (appointment) => {
  logger.info("Received a request to schedule an appointment");
  logger.info("Auto approving...");
  const client = new FHIRServer(config.hapiFhirUrl);

  const appointmentStart = appointment.start;
  const appointmentEnd = appointment.end;
  const appointmentIdentifier = appointment.identifier[0];
  const participants = appointment.participant;

  const patientParticipant = participants.filter(
    (participant) => participant.actor && participant.actor.type === "Patient"
  )[0];
  const patientId = patientParticipant.actor.identifier.value;

  const practitionerParticipant = participants.filter(
    (participant) =>
      participant.actor && participant.actor.type === "Practitioner"
  )[0];
  const practitionerId = practitionerParticipant.actor.identifier.value;

  const locationParticipant = participants.filter(
    (participant) => participant.actor && participant.actor.type === "Location"
  )[0];
  const locationId = locationParticipant.actor.identifier.value;

  logger.info("Fetching patient, practitioner, and location");

  const [patient, practitioner, location] = await Promise.all([
    client.get("Patient", patientId),
    client.get("Practitioner", practitionerId),
    client.get("Location", locationId),
  ]);

  logger.info("Got resources");

  const patientName = patient.name[0].text;
  const patientTelecoms = patient.telecom;
  const patientEmailTelecom = patientTelecoms.filter(
    (telecom) => telecom.system === "email"
  );
  const patientEmail = patientEmailTelecom.value;
  const locationName = location.name;
  const practitionerName = practitioner.name[0].text;

  const appointmentResponse = {
    resourceType: "AppointmentResponse",
    identifier: [
      {
        value: uuid(),
      },
    ], // External Ids for this item
    appointment: {
      identifier: appointmentIdentifier,
      display: "Appointment",
    },
    start: appointmentStart,
    end: appointmentEnd,
    actor: locationParticipant.actor,
    participantStatus: "accepted",
    comment: "Scheduled using Coeus, powered by DFS", // Additional comments
  };

  logger.info("Constructed appointment response resource");
  logger.info("Creating event in provider outlook");

  const timezone = "US/Eastern"; // TODO: do not hard code this

  let appointmentDescription = appointment.description;
  appointmentDescription += "\n";
  appointmentDescription += `Patient ID: ${patientId}\n`;
  appointmentDescription += `Patient Name: ${patientName}\n`;
  appointmentDescription += `Location ID: ${locationId}\n`;
  appointmentDescription += `Location: ${locationName}\n`;
  appointmentDescription += `Requested practitioner ID: ${practitionerId}\n`;
  appointmentDescription += `Requested practitioner name: ${practitionerName}`;

  const appointmentStartTime = {
    dateTime: appointmentStart,
    timezone,
  };
  const appointmentEndTime = {
    dateTime: appointmentEnd,
    timezone,
  };
  const createEventUrl = "https://graph.microsoft.com/v1.0/me/calendar/events";
  const createEventPayload = {
    subject: "Appointment",
    body: { contentType: "text", content: appointmentDescription },
    start: appointmentStartTime,
    end: appointmentEndTime,
    showAs: "busy",
    attendees: [],
    location: {
      displayName: location.name,
      address: {
        city: location.address.city,
        postalCode: location.address.postalCode,
        state: location.address.state,
        street: location.address.text.split(",")[0],
      },
      locationType: "businessAddress",
    },
  };

  try {
    await axios
      .post(createEventUrl, createEventPayload, {
        headers: {
          Authorization: `Bearer ${process.env.PROVIDER_ACCESS_TOKEN}`,
        },
      })
      .then((response) => response.data);
  } catch (err) {
    logger.error("Error when creating provider outlook event");
    logger.error(err);
  }

  logger.info("Event created in provider outlook");
  logger.info("Sending response back to iDaaS-Connect...");

  await axios.post(
    `${config.idaasConnectUrl}/projherophilus/appointmentresponse`,
    appointmentResponse
  );

  logger.info("Sent to iDaaS-Connect");
};

// Rrefresh access token every 30 min
cron.schedule("*/30 * * * *", async () => {
  await refreshTokens(
    config.oauth.tenantId,
    config.oauth.clientId,
    config.oauth.clientSecret,
    process.env.PROVIDER_REFRESH_TOKEN
  );
});

const main = async () => {
  await refreshTokens(
    config.oauth.tenantId,
    config.oauth.clientId,
    config.oauth.clientSecret,
    process.env.PROVIDER_REFRESH_TOKEN
  );

  const api = createApi();
  api.listen(config.port, () =>
    logger.info(`Provider API listening on port ${config.port}`)
  );

  await consumer.connect();

  await consumer.subscribe({
    topic: config.kafkaTopic,
  });

  logger.info(`Consumer listening for topic '${config.kafkaTopic}'`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        await processMessage(
          topic,
          partition,
          message.key ? message.key.toString() : null,
          message.value ? JSON.parse(message.value.toString()) : null
        );
      } catch (e) {
        logger.error("Error processing message");
        logger.error(message);
        throw e;
      }
    },
  });
};

main().catch(async (error) => {
  logger.error(error);
  try {
    await consumer.disconnect();
  } catch (e) {
    logger.error("Failed to gracefully disconnect consumer", e);
  }
  process.exit(1);
});
