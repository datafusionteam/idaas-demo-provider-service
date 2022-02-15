const kafka = require("./kafka");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const cron = require("node-cron");
const config = require("./config");
const { refreshTokens } = require("./oauth");
const createApi = require("./api");
const { FHIRServer } = require("./fhir");

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
});

const processMessage = async (topic, partition, key, value) => {
  switch (topic) {
    case "fhirsvr_appointment":
      await handleAppointmentReceived(value);
      break;
    default:
      break;
  }
};

const handleAppointmentReceived = async (appointment) => {
  console.log("Received a request to schedule an appointment");
  console.log("Auto approving...");
  const client = new FHIRServer(config.hapiFhir.host);

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

  console.log("Fetching patient, practitioner, and location");
  const [patient, practitioner, location] = await Promise.all([
    client.get("Patient", patientId),
    client.get("Practitioner", practitionerId),
    client.get("Location", locationId),
  ]);
  console.log("Got resources");

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

  console.log("Constructed appointment response resource");

  console.log("Creating event in provider outlook");
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
    console.log("Error when creating provider outlook event");
    console.log(err);
  }
  console.log("Event created in provider outlook");

  console.log("Sending response back to iDaaS-Connect...");
  await axios.post(
    `http://${config.idaasConnectUrl}/projherophilus/appointmentresponse`,
    appointmentResponse
  );
  console.log("Sent to iDaaS-Connect");
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
    console.log(`Provider API listening on port ${config.port}`)
  );

  await consumer.connect();

  await consumer.subscribe({
    topic: config.kafkaTopic,
  }); // subscribe to all appointment transactions

  console.log(`Consumer listening for topic '${config.kafkaTopic}'`);

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
        console.error("Error processing message");
        console.log(message);
        throw e;
      }
    },
  });
};

main().catch(async (error) => {
  console.error(error);
  try {
    await consumer.disconnect();
  } catch (e) {
    console.error("Failed to gracefully disconnect consumer", e);
  }
  process.exit(1);
});
