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

const dayjs = require("dayjs");
const express = require("express");
const morgan = require("morgan");
const { v4: uuid } = require("uuid");
const UTCPlugin = require("dayjs/plugin/utc");
const TimezonePlugin = require("dayjs/plugin/timezone");
const { FHIRServer } = require("./fhir");
const logger = require("./logger");
const config = require("./config");

dayjs.extend(UTCPlugin);
dayjs.extend(TimezonePlugin);

const createApi = () => {
  const app = express();

  app.use(morgan("short"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const api = express.Router();

  app.get("/healthz", (req, res, next) => {
    res.json({
      version: require("../package.json").version,
      healthy: true,
    });
  });

  api.get("/patient", async (req, res) => {
    try {
      const email = req.query.email;
      const phoneNumber = req.query.phoneNumber;

      if (!email) {
        return res
          .status(400)
          .json({ error: "More input required", error_code: "bad_request" });
      }

      const searchParams = { email };

      if (phoneNumber) {
        searchParams.phoneNumber = phoneNumber;
      }
      const server = new FHIRServer(config.hapiFhirUrl);
      const patients = await server.search("Patient", searchParams);

      if (Array.isArray(patients) && patients.length > 0) {
        const patient = patients[0].resource;
        res.status(200).json(patient);
      } else {
        res
          .status(404)
          .json({ error: "No patient found", error_code: "patient_not_found" });
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  api.post("/patient", async (req, res) => {
    try {
      const server = new FHIRServer(config.hapiFhirUrl);
      const formValues = req.body;

      console.log({ newPatient: formValues });

      const fullStreetAddressText =
        `${formValues.address} ${formValues.address2}`.trim();

      const patientResource = {
        resourceType: "Patient",
        active: true,
        identifier: [
          {
            value: formValues.birthDate,
          },
          {
            value: formValues.address,
          },
        ],
        name: [
          {
            use: "official",
            text: formValues.name,
          },
        ],
        telecom: [
          {
            system: "phone",
            value: formValues.phoneNumber,
            use: "mobile",
          },
          {
            system: "email",
            value: formValues.email,
            use: "home",
          },
        ],
        gender:
          formValues.sex === "M"
            ? "male"
            : formValues.sex === "F"
            ? "female"
            : "other",
        birthDate: formValues.birthDate, // YYYY-MM-DD
        address: [
          {
            use: "home",
            line: [formValues.address, formValues.address2],
            city: formValues.city,
            state: formValues.state,
            postalCode: formValues.zipCode,
            country: formValues.country,
            text: `${fullStreetAddressText}, ${formValues.city}, ${formValues.state} ${formValues.zipCode}`,
          },
        ],
      };
      const response = await server.create("Patient", patientResource);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  api.get("/locations", async (req, res) => {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const distance = req.query.distance;
    const distanceUnits = req.query.units || "mi";

    try {
      const server = new FHIRServer(config.hapiFhirUrl);
      const results = await server.search("Location", {
        near: `${latitude}|${longitude}|${distance}|${distanceUnits}`,
      });
      const locations = results.map((result) => result.resource);
      res.status(200).json(locations);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  api.get("/locations/:locationId/practitioners", async (req, res) => {
    const locationId = req.params.locationId;
    // TODO: use location id to create relation on practitioner

    try {
      const server = new FHIRServer(config.hapiFhirUrl);
      const results = await server.search("Practitioner");
      const practitioners = results.map((result) => result.resource);
      res.status(200).json(practitioners);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  api.get("/slots", (req, res) => {
    const timezone = req.query.timezone || "America/New_York";
    const appointmentTime = req.query.appointmentTime || "afternoon";

    const now = dayjs().tz(timezone);

    const afternoonSlots = [
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(1, "day").hour(12).minute(0).toISOString(),
        end: now.add(1, "day").hour(12).minute(30).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(1, "day").hour(12).minute(30).toISOString(),
        end: now.add(1, "day").hour(13).minute(0).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(2, "day").hour(14).minute(0).toISOString(),
        end: now.add(2, "day").hour(14).minute(30).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(2, "day").hour(14).minute(30).toISOString(),
        end: now.add(2, "day").hour(15).minute(0).toISOString(),
      },
    ];

    const morningSlots = [
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(1, "day").hour(9).minute(0).toISOString(),
        end: now.add(1, "day").hour(9).minute(30).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(1, "day").hour(9).minute(30).toISOString(),
        end: now.add(1, "day").hour(10).minute(0).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(2, "day").hour(9).minute(0).toISOString(),
        end: now.add(2, "day").hour(9).minute(30).toISOString(),
      },
      {
        resourceType: "Slot",
        id: uuid(),
        status: "free",
        start: now.add(2, "day").hour(9).minute(30).toISOString(),
        end: now.add(2, "day").hour(10).minute(0).toISOString(),
      },
    ];

    let slots;
    if (appointmentTime === "morning") {
      slots = morningSlots;
    } else {
      slots = afternoonSlots;
    }

    res.status(200).json(slots);
  });

  app.use("/api", api);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    err.code = "route_not_found";
    next(err);
  });

  // error handler
  app.use((err, req, res, next) => {
    console.log(err);

    let status = err.status || 500;
    let code = err.code || "server_error";
    let message = err.message || "Internal server error";

    logger.error(`${code} - ${message}`);

    res.status(err.status).json({
      status,
      message,
      code,
      success: status < 400,
    });
  });

  return app;
};

module.exports = createApi;
